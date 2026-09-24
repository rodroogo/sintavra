# ADR 0001 — Sin servicios de pago

Contexto: el usuario fija presupuesto cero y delega decisiones. La especificación inicial planteaba ejecución remota en siete lenguajes e IA comercial.

Opciones: suscripciones de IA, cuotas promocionales externas, runtimes en navegador, servicios locales. Se eligen Python/JS en navegador y WebLLM optativo. Las cuotas promocionales no son una base confiable para uso ilimitado.

Consecuencias: ningún secreto o factura por token; hay descarga inicial, requisitos de hardware y motores pendientes. D1 reemplaza PostgreSQL en esta edición alojada. Las cuotas y disponibilidad del hosting no se convierten en una garantía de gratuidad perpetua.
