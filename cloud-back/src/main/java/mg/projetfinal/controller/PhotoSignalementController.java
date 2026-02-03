package mg.projetfinal.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import mg.projetfinal.dto.PhotoSignalementDTO;
import mg.projetfinal.entity.PhotoSignalement;
import mg.projetfinal.entity.Session;
import mg.projetfinal.entity.User;
import mg.projetfinal.service.AuthService;
import mg.projetfinal.service.PhotoSignalementService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/photos")
@RequiredArgsConstructor
@Tag(name = "Photos", description = "API de gestion des photos de signalement")
public class PhotoSignalementController {

    private final PhotoSignalementService photoService;
    private final AuthService authService;

    @PostMapping("/signalement/{signalementId}")
    @Operation(summary = "Ajouter une photo à un signalement")
    public ResponseEntity<?> addPhoto(
            @PathVariable Long signalementId,
            @RequestBody PhotoRequest request,
            HttpServletRequest httpRequest) {
        try {
            User user = getCurrentUser(httpRequest);

            PhotoSignalement photo = photoService.addPhoto(
                    signalementId,
                    request.getUrl(),
                    request.getDescription(),
                    user
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(photo));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/signalement/{signalementId}")
    @Operation(summary = "Récupérer toutes les photos d'un signalement")
    public ResponseEntity<?> getPhotosBySignalement(@PathVariable Long signalementId) {
        try {
            List<PhotoSignalement> photos = photoService.getPhotosBySignalement(signalementId);
            List<PhotoSignalementDTO> dtos = photos.stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/signalement/{signalementId}/principale")
    @Operation(summary = "Récupérer la photo principale d'un signalement")
    public ResponseEntity<?> getPhotoPrincipale(@PathVariable Long signalementId) {
        try {
            PhotoSignalement photo = photoService.getPhotoPrincipale(signalementId);
            if (photo == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(toDTO(photo));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(false, e.getMessage()));
        }
    }

    @PutMapping("/{photoId}/principale")
    @Operation(summary = "Définir une photo comme principale")
    public ResponseEntity<?> setPrincipale(@PathVariable Long photoId) {
        try {
            PhotoSignalement photo = photoService.setPrincipale(photoId);
            return ResponseEntity.ok(toDTO(photo));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(false, e.getMessage()));
        }
    }

    @DeleteMapping("/{photoId}")
    @Operation(summary = "Supprimer une photo")
    public ResponseEntity<?> deletePhoto(@PathVariable Long photoId) {
        try {
            photoService.deletePhoto(photoId);
            return ResponseEntity.ok(new SuccessResponse(true, "Photo supprimée avec succès"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(false, e.getMessage()));
        }
    }

    @PutMapping("/signalement/{signalementId}/reorder")
    @Operation(summary = "Réordonner les photos d'un signalement")
    public ResponseEntity<?> reorderPhotos(
            @PathVariable Long signalementId,
            @RequestBody ReorderRequest request) {
        try {
            photoService.reorderPhotos(signalementId, request.getPhotoIds());
            return ResponseEntity.ok(new SuccessResponse(true, "Photos réordonnées avec succès"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(false, e.getMessage()));
        }
    }

    private PhotoSignalementDTO toDTO(PhotoSignalement photo) {
        return PhotoSignalementDTO.builder()
                .id(photo.getId())
                .url(photo.getUrl())
                .description(photo.getDescription())
                .ordre(photo.getOrdre())
                .isPrincipale(photo.getIsPrincipale())
                .uploadedBy(photo.getUploadedBy() != null ? photo.getUploadedBy().getName() : null)
                .createdAt(photo.getCreatedAt().toString())
                .build();
    }

    private User getCurrentUser(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Non authentifié");
        }
        String token = authHeader.substring(7);
        return authService.validateSession(token)
                .map(Session::getUser)
                .orElseThrow(() -> new RuntimeException("Session invalide"));
    }

    @lombok.Data
    static class PhotoRequest {
        private String url;
        private String description;
    }

    @lombok.Data
    static class ReorderRequest {
        private List<Long> photoIds;
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    static class SuccessResponse {
        private Boolean success;
        private String message;
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    static class ErrorResponse {
        private Boolean success;
        private String message;
    }
}