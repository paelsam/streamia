# package.json

```
#scripts

"dev:player": "npm run dev --workspace=@streamia/player-mfe",

"build:player": "npm run build --workspace=@streamia/player-mfe",
```

# start-dev.sh

```
# declare -a MFE_CONFIGS
"Player MFE:player-mfe:3003"
```

# Lo de mi MFE
```
### Rutas
- `/movie/:id` - Detalle y reproducción

### Configuración Module Federation
- **Puerto:** 3003
- **Exposes:** `./App`
- **Shared:** React, React-DOM, React-Router-DOM

### API Endpoints
- `GET /api/movies/:id` - Obtener película
- `GET /api/comments/movie/:movieId` - Listar comentarios
- `POST /api/comments` - Crear comentario
- `PUT /api/comments/:id` - Editar comentario
- `DELETE /api/comments/:id` - Eliminar comentario
- `GET /api/ratings/movie/:movieId` - Obtener calificación
- `POST /api/ratings` - Crear/actualizar calificación
- `DELETE /api/ratings/:movieId` - Eliminar calificación

### Eventos
**Emitidos:**
- `favorite:added` - Favorito añadido
- `rating:updated` - Calificación actualizada

**Escuchados:**
- `user:authenticated` - Usuario autenticado
```