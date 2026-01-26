# TileServer avec fichier mbtiles pré-téléchargé
FROM maptiler/tileserver-gl:latest

WORKDIR /data

# Copier le fichier mbtiles téléchargé depuis MapTiler
# Le fichier doit être placé dans le dossier tileserver/
COPY antananarivo.mbtiles /data/antananarivo.mbtiles

EXPOSE 8080

# Lancer TileServer directement avec le fichier mbtiles
CMD ["tileserver-gl", "--mbtiles", "/data/antananarivo.mbtiles", "--verbose"]