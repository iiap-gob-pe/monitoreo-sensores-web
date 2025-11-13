-- ============================================================================
-- Script SEGURO para limpiar datos del simulador y reiniciar IDs
-- ============================================================================
-- Este script cancela cualquier transacción previa automáticamente
-- ============================================================================

-- Cancelar cualquier transacción anterior que esté abierta
ROLLBACK;

-- Iniciar nueva transacción
BEGIN;

-- Mostrar advertencia
DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE '⚠️  ADVERTENCIA: LIMPIEZA DE BASE DE DATOS';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Este script eliminará:';
    RAISE NOTICE '- Todas las alertas';
    RAISE NOTICE '- Todas las lecturas';
    RAISE NOTICE '- Todos los sensores';
    RAISE NOTICE '- Todos los umbrales de sensores';
    RAISE NOTICE '- Todos los recorridos guardados';
    RAISE NOTICE '- Todos los usuarios (excepto admin id=1)';
    RAISE NOTICE '- Logs y preferencias (excepto admin)';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Los IDs se reiniciarán desde 1';
    RAISE NOTICE '============================================';
END $$;

-- Mostrar conteo ANTES de la limpieza
DO $$
DECLARE
    count_sensores INTEGER;
    count_lecturas INTEGER;
    count_alertas INTEGER;
    count_umbrales INTEGER;
    count_recorridos INTEGER;
    count_usuarios INTEGER;
    count_logs INTEGER;
BEGIN
    SELECT COUNT(*) INTO count_sensores FROM sensores;
    SELECT COUNT(*) INTO count_lecturas FROM lecturas;
    SELECT COUNT(*) INTO count_alertas FROM alertas;
    SELECT COUNT(*) INTO count_umbrales FROM sensor_umbral;
    SELECT COUNT(*) INTO count_recorridos FROM recorridos_guardados;
    SELECT COUNT(*) INTO count_usuarios FROM usuarios;
    SELECT COUNT(*) INTO count_logs FROM logs_actividad;

    RAISE NOTICE 'ESTADO ACTUAL (antes de limpiar):';
    RAISE NOTICE '- Sensores: %', count_sensores;
    RAISE NOTICE '- Lecturas: %', count_lecturas;
    RAISE NOTICE '- Alertas: %', count_alertas;
    RAISE NOTICE '- Umbrales: %', count_umbrales;
    RAISE NOTICE '- Recorridos: %', count_recorridos;
    RAISE NOTICE '- Usuarios: %', count_usuarios;
    RAISE NOTICE '- Logs: %', count_logs;
    RAISE NOTICE '============================================';
END $$;

-- ============================================================================
-- LIMPIEZA DE DATOS
-- ============================================================================

-- 1. Eliminar alertas
TRUNCATE TABLE alertas RESTART IDENTITY CASCADE;

-- 2. Eliminar lecturas
TRUNCATE TABLE lecturas RESTART IDENTITY CASCADE;

-- 3. Eliminar umbrales de sensores
TRUNCATE TABLE sensor_umbral RESTART IDENTITY CASCADE;

-- 4. Eliminar recorridos guardados
TRUNCATE TABLE recorridos_guardados RESTART IDENTITY CASCADE;

-- 5. Eliminar sensores (CASCADE eliminará referencias)
TRUNCATE TABLE sensores RESTART IDENTITY CASCADE;

-- 6. Eliminar logs de actividad (excepto del admin)
DELETE FROM logs_actividad
WHERE id_usuario != 1;

-- 7. Eliminar preferencias del sistema (excepto del admin)
DELETE FROM preferencias_sistema
WHERE id_usuario != 1;

-- 8. Eliminar usuarios (excepto admin)
DELETE FROM usuarios
WHERE id_usuario != 1;

-- 9. Reiniciar secuencia de usuarios
ALTER SEQUENCE usuarios_id_usuario_seq RESTART WITH 2;

-- ============================================================================
-- VERIFICACIÓN Y RESUMEN
-- ============================================================================

-- Verificar que el admin existe
DO $$
DECLARE
    admin_exists BOOLEAN;
    admin_username VARCHAR;
    admin_email VARCHAR;
    admin_rol VARCHAR;
BEGIN
    SELECT
        EXISTS(SELECT 1 FROM usuarios WHERE id_usuario = 1),
        username,
        email,
        rol
    INTO admin_exists, admin_username, admin_email, admin_rol
    FROM usuarios
    WHERE id_usuario = 1;

    IF NOT admin_exists THEN
        RAISE EXCEPTION '❌ ERROR CRÍTICO: No se encontró usuario admin (id_usuario = 1)';
    END IF;

    RAISE NOTICE '============================================';
    RAISE NOTICE '✅ VERIFICACIÓN DE ADMIN';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'ID: 1';
    RAISE NOTICE 'Username: %', admin_username;
    RAISE NOTICE 'Email: %', admin_email;
    RAISE NOTICE 'Rol: %', admin_rol;
    RAISE NOTICE '============================================';
END $$;

-- Mostrar resumen DESPUÉS de la limpieza
DO $$
DECLARE
    count_sensores INTEGER;
    count_lecturas INTEGER;
    count_alertas INTEGER;
    count_umbrales INTEGER;
    count_recorridos INTEGER;
    count_usuarios INTEGER;
    count_logs INTEGER;
    count_preferencias INTEGER;
BEGIN
    SELECT COUNT(*) INTO count_sensores FROM sensores;
    SELECT COUNT(*) INTO count_lecturas FROM lecturas;
    SELECT COUNT(*) INTO count_alertas FROM alertas;
    SELECT COUNT(*) INTO count_umbrales FROM sensor_umbral;
    SELECT COUNT(*) INTO count_recorridos FROM recorridos_guardados;
    SELECT COUNT(*) INTO count_usuarios FROM usuarios;
    SELECT COUNT(*) INTO count_logs FROM logs_actividad;
    SELECT COUNT(*) INTO count_preferencias FROM preferencias_sistema;

    RAISE NOTICE '============================================';
    RAISE NOTICE '📊 ESTADO DESPUÉS DE LA LIMPIEZA';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Sensores: % (IDs reinician desde 1)', count_sensores;
    RAISE NOTICE 'Lecturas: % (IDs reinician desde 1)', count_lecturas;
    RAISE NOTICE 'Alertas: % (IDs reinician desde 1)', count_alertas;
    RAISE NOTICE 'Umbrales: % (IDs reinician desde 1)', count_umbrales;
    RAISE NOTICE 'Recorridos: % (IDs reinician desde 1)', count_recorridos;
    RAISE NOTICE 'Usuarios: % (solo admin)', count_usuarios;
    RAISE NOTICE 'Logs: % (solo admin)', count_logs;
    RAISE NOTICE 'Preferencias: % (solo admin)', count_preferencias;
    RAISE NOTICE '============================================';

    IF count_sensores = 0 AND
       count_lecturas = 0 AND
       count_alertas = 0 AND
       count_usuarios = 1 THEN
        RAISE NOTICE '✅ LIMPIEZA COMPLETADA EXITOSAMENTE';
        RAISE NOTICE '============================================';
        RAISE NOTICE '⚠️  IMPORTANTE: Revisa los resultados';
        RAISE NOTICE '- Si todo está correcto, ejecuta: COMMIT;';
        RAISE NOTICE '- Si quieres revertir, ejecuta: ROLLBACK;';
        RAISE NOTICE '============================================';
    ELSE
        RAISE WARNING '⚠️  Verifica los conteos antes de confirmar';
    END IF;
END $$;

-- ============================================================================
-- NO CONFIRMAR AUTOMÁTICAMENTE - REQUIERE REVISIÓN MANUAL
-- ============================================================================
-- La transacción queda abierta para que puedas revisar los resultados
--
-- Para CONFIRMAR los cambios, ejecuta:
-- COMMIT;
--
-- Para REVERTIR los cambios, ejecuta:
-- ROLLBACK;
-- ============================================================================
