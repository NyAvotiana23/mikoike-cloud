param(
    [string]$TargetPath = "."
)

# Dossiers à exclure
$excluded = @("node_modules", "android", ".git", "www", "build", "dist", ".vscode", ".git")


# Chemin absolu du dossier cible
$root = Resolve-Path $TargetPath

# Parcourir tous les fichiers et dossiers
Get-ChildItem -Path $root -Recurse -Force |
Where-Object {
    # Exclure si c'est un dossier à exclure
    -not ($excluded -contains $_.PSIsContainer -and $excluded -contains $_.Name)
} |
ForEach-Object {
    # Générer un chemin relatif au dossier racine
    $_.FullName.Replace($root.Path, "").TrimStart('\')
} | Out-File "tree.txt" -Encoding utf8
