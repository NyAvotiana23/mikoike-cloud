# Root Java source directory
$srcRoot = "src\main\java"
$srcRootResolved = (Resolve-Path $srcRoot).Path

# Traverse all package directories
Get-ChildItem -Path $srcRootResolved -Directory -Recurse | ForEach-Object {

    $packageDir = $_
    $javaFiles = Get-ChildItem -Path $packageDir.FullName -Filter *.java -File

    # Only process directories containing Java files
    if ($javaFiles.Count -gt 0) {

        # Build Java package name (com.company.erp.entity.achat)
        $relativePath = $packageDir.FullName.Substring($srcRootResolved.Length + 1)
        $packageName = $relativePath -replace '\\', '.'

        # Output file inside the package directory
        $outputFile = Join-Path $packageDir.FullName ($packageName + ".txt")

        # Remove existing file if present
        if (Test-Path $outputFile) {
            Remove-Item $outputFile
        }

        foreach ($file in $javaFiles) {

            Add-Content -Path $outputFile -Encoding UTF8 -Value (
@"
============================================================
FILE: $($file.Name)
PACKAGE: $packageName
============================================================

"@)

            Get-Content -Path $file.FullName -Encoding UTF8 |
                Add-Content -Path $outputFile -Encoding UTF8

            Add-Content -Path $outputFile -Encoding UTF8 -Value "`n`n"
        }

        Write-Host "Created:" $outputFile
    }
}

Write-Host "`nDone. Each package now contains a .txt named after the package."
