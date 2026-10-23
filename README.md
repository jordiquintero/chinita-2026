# Chinita 2026 · Ancla del Alma

Manto para la réplica de Nuestra Señora del Rosario de Chiquinquirá, 18 de noviembre de 2026. Es la propuesta n.º 11, la elegida.

Se ve en línea en **https://jordiquintero.github.io/chinita-2026/**.

| Ruta | Contenido |
|---|---|
| `index.html` | Portada con los enlaces |
| `presentacion/presentacion-ancla-del-alma.pdf` | Presentación: nombre, dedicatoria, intención, símbolos y texto para leer o publicar (11 páginas) |
| `visor-3d/` | Visor 3D: capas, piezas y fases de confección |
| `manual/manual-ancla-del-alma.pdf` | Manual de taller (33 páginas) |
| `materiales/lista-de-materiales.xlsx` | Lista de materiales con casillas de compra |
| `materiales/compras.csv` | La hoja de compras en CSV |

Las cotas son para un manto de 200 cm de alto y 150 cm al pie. No se corta tela ni se imprime el DTF hasta medir la réplica.

## Actualización 23-oct-2026

- `dtf-rev2/`: galería de 11 PNG, agua 11171×4794 px (aprox. 170×73 cm a 167 ppp), olas de dos filas y dos ZIP de descarga.
- `visor-3d/interaccion.js` y `.css`: recorrido y búsqueda por capas, enfoque, giro manual activable, captura, enlaces compartibles, teclado y panel móvil que reserva espacio a la escena.
- El visor abre por defecto el montaje **DTF rev2** con 11 artes: agua ampliada, dos filas de olas, emblema champán, ramos, horizonte, amarra, destellos y orlas. Cada arte puede seleccionarse, aislarse y separarse en profundidad. El agua y las olas pueden ocultarse individualmente.
- El agua se coloca a 170 cm de ancho con altura proporcional, y se recorta mediante UV al trapecio de referencia de 200 × 150 cm: no se estira. Los demás artes conservan su proporción; las orlas se repiten por módulos.
- `visor-3d/texturas-rev2/`: vistas WebP hasta 2048 px derivadas de los PNG maestros (sin modificar los originales); `manifest.json` conserva la ruta original, recorte de transparencia y tamaño. `preparar-texturas.py` permite reproducirlas.
- **Esquema de taller** conserva las piezas y fases anteriores como referencia. El montaje rev2 es una previsualización de colocación y relieve impreso, no un patrón definitivo ni una simulación de caída de tela. Las medidas siguen pendientes.
