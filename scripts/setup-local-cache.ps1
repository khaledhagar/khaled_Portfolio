# Relocates .next and node_modules OUT of the OneDrive-synced project tree
# using Windows directory junctions. OneDrive skips reparse points, so it can
# never sync, lock, or corrupt the build cache again — which is the root cause
# of the "page always fails to load" problem in dev.
#
# Safe to re-run (idempotent). After a fresh `git clone`:
#   1. npm run setup:cache   # creates the junctions
#   2. npm install           # installs straight into the relocated node_modules
#
# The real folders live under <project-drive>:\next-cache\<project-name>.
# IMPORTANT: the cache MUST be on the same drive as the project. A junction to
# another drive makes webpack/Next emit broken cross-drive "./C:/..." paths.

$ErrorActionPreference = "Stop"

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$drive       = Split-Path $projectRoot -Qualifier   # e.g. "D:"
$cacheRoot   = Join-Path "$drive\" ("next-cache\" + (Split-Path $projectRoot -Leaf))
New-Item -ItemType Directory -Force -Path $cacheRoot | Out-Null

function Set-CacheJunction {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [switch]$Preserve   # copy existing contents into the cache before relinking
    )

    $link   = Join-Path $projectRoot $Name
    $target = Join-Path $cacheRoot   $Name

    if (Test-Path $link) {
        $item = Get-Item $link -Force
        if ($item.LinkType -eq "Junction") {
            # Self-heal: a junction pointing to the WRONG target (e.g. another
            # drive) is the root cause of broken cross-drive "./C:/..." paths.
            # Compare resolved full paths case-insensitively.
            $current  = ($item.Target | Select-Object -First 1)
            $expected = (Resolve-Path -LiteralPath (Split-Path $target -Parent)).Path
            $expected = Join-Path $expected (Split-Path $target -Leaf)
            if ($current -and ($current.TrimEnd('\') -ieq $expected.TrimEnd('\'))) {
                Write-Host "[$Name] already a junction -> $current (ok)"
                return
            }

            Write-Host "[$Name] junction points to WRONG target: $current"
            Write-Host "[$Name] repairing to -> $target"
            # fsutil clears the reparse point even when OneDrive has PINNED/locked
            # it (plain rmdir/attrib return 'Access is denied' in that case).
            & cmd /c "fsutil reparsepoint delete `"$link`"" | Out-Null
            & cmd /c "attrib -r -s -h -p `"$link`"" 2>$null | Out-Null
            [System.IO.Directory]::Delete($link, $true)
            New-Item -ItemType Directory -Force -Path $target | Out-Null
            New-Item -ItemType Junction -Path $link -Target $target | Out-Null
            Write-Host "[$Name] junction -> $target"
            return
        }

        New-Item -ItemType Directory -Force -Path $target | Out-Null

        if ($Preserve) {
            Write-Host "[$Name] copying existing contents out of OneDrive (one-time)..."
            # robocopy success codes are 0-7; it does not throw in PowerShell.
            robocopy $link $target /E /NFL /NDL /NJH /NJS /NC /NS /NP | Out-Null
        }

        # Keep a recoverable backup instead of an immediate delete.
        $backup = "$link.onedrive-old"
        if (Test-Path $backup) { Remove-Item $backup -Recurse -Force }
        Rename-Item $link $backup
        Write-Host "[$Name] original kept at: $backup (delete once dev verifies OK)"
    } else {
        New-Item -ItemType Directory -Force -Path $target | Out-Null
    }

    New-Item -ItemType Junction -Path $link -Target $target | Out-Null
    Write-Host "[$Name] junction -> $target"
}

Set-CacheJunction -Name ".next"
Set-CacheJunction -Name "node_modules" -Preserve

Write-Host ""
Write-Host "Done. OneDrive now skips .next and node_modules; they live under:"
Write-Host "  $cacheRoot"
Write-Host "Run 'npm run dev' to verify, then delete any *.onedrive-old folders."
exit 0
