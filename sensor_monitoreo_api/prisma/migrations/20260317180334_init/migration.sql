-- CreateTable
CREATE TABLE "sensores" (
    "id_sensor" VARCHAR(50) NOT NULL,
    "nombre_sensor" VARCHAR(100) NOT NULL,
    "zona" VARCHAR(20) NOT NULL,
    "is_movil" BOOLEAN DEFAULT false,
    "description" TEXT,
    "installation_date" DATE DEFAULT CURRENT_DATE,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "last_seen" TIMESTAMP(6),
    "estado" VARCHAR(20) DEFAULT 'Activo',

    CONSTRAINT "sensores_pkey" PRIMARY KEY ("id_sensor")
);

-- CreateTable
CREATE TABLE "lecturas" (
    "id_lectura" SERIAL NOT NULL,
    "id_sensor" VARCHAR(50),
    "lectura_datetime" TIMESTAMP(6) NOT NULL,
    "temperatura" DECIMAL(5,2),
    "humedad" DECIMAL(5,2),
    "co2_nivel" INTEGER,
    "co_nivel" DECIMAL(6,2),
    "latitud" DECIMAL(10,8),
    "longitud" DECIMAL(11,8),
    "altitud" DECIMAL(8,2),
    "zona" VARCHAR(20),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lecturas_pkey" PRIMARY KEY ("id_lectura")
);

-- CreateTable
CREATE TABLE "alertas" (
    "id_alerta" SERIAL NOT NULL,
    "id_sensor" VARCHAR(50),
    "alerta_tipo" VARCHAR(50) NOT NULL,
    "parametro_nombre" VARCHAR(30),
    "umbral_valor" DECIMAL(10,2),
    "actual_valor" DECIMAL(10,2),
    "mensaje" TEXT NOT NULL,
    "gravedad" VARCHAR(20) DEFAULT 'Medio',
    "se_activo_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "resuelto_at" TIMESTAMP(6),
    "is_resolved" BOOLEAN DEFAULT false,

    CONSTRAINT "alertas_pkey" PRIMARY KEY ("id_alerta")
);

-- CreateTable
CREATE TABLE "sensor_umbral" (
    "id_sensor_umbral" SERIAL NOT NULL,
    "id_sensor" VARCHAR(50),
    "parametro_nombre" VARCHAR(30) NOT NULL,
    "min_umbral" DECIMAL(10,2),
    "max_umbral" DECIMAL(10,2),
    "alerta_habilitar" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sensor_umbral_pkey" PRIMARY KEY ("id_sensor_umbral")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id_usuario" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "nombre_completo" VARCHAR(100) NOT NULL,
    "rol" VARCHAR(20) NOT NULL,
    "estado" VARCHAR(20) DEFAULT 'activo',
    "ultimo_acceso" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "logs_actividad" (
    "id_log" SERIAL NOT NULL,
    "id_usuario" INTEGER,
    "username" VARCHAR(50),
    "accion" VARCHAR(100) NOT NULL,
    "tabla_afectada" VARCHAR(50),
    "id_registro" VARCHAR(100),
    "detalles" TEXT,
    "ip_address" VARCHAR(50),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_actividad_pkey" PRIMARY KEY ("id_log")
);

-- CreateTable
CREATE TABLE "recorridos_guardados" (
    "id_recorrido" SERIAL NOT NULL,
    "id_sensor" VARCHAR(50) NOT NULL,
    "nombre_recorrido" VARCHAR(100) NOT NULL,
    "fecha_recorrido" DATE NOT NULL,
    "hora_inicio" TIMESTAMP(6) NOT NULL,
    "hora_fin" TIMESTAMP(6) NOT NULL,
    "total_puntos" INTEGER NOT NULL,
    "distancia_km" DECIMAL(10,2),
    "duracion_minutos" INTEGER,
    "puntos_geojson" JSONB NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "usuario_creo" VARCHAR(50),

    CONSTRAINT "recorridos_guardados_pkey" PRIMARY KEY ("id_recorrido")
);

-- CreateTable
CREATE TABLE "preferencias_sistema" (
    "id_preferencia" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "zona_horaria" VARCHAR(50) DEFAULT 'America/Lima',
    "formato_fecha" VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    "intervalo_actualizacion" INTEGER DEFAULT 30,
    "registros_por_pagina" INTEGER DEFAULT 20,
    "mostrar_graficos" BOOLEAN DEFAULT true,
    "animaciones_graficos" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "preferencias_sistema_pkey" PRIMARY KEY ("id_preferencia")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id_api_key" SERIAL NOT NULL,
    "key_name" VARCHAR(100) NOT NULL,
    "api_key" VARCHAR(64) NOT NULL,
    "id_sensor" VARCHAR(50),
    "descripcion" TEXT,
    "esta_activo" BOOLEAN NOT NULL DEFAULT true,
    "ultima_uso" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "expires_at" TIMESTAMP(6),

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id_api_key")
);

-- CreateIndex
CREATE INDEX "idx_lecturas_lectura_datetime" ON "lecturas"("lectura_datetime" DESC);

-- CreateIndex
CREATE INDEX "idx_lecturas_sensor_lectura_datetime" ON "lecturas"("id_sensor", "lectura_datetime" DESC);

-- CreateIndex
CREATE INDEX "idx_alertas_sensor_se_activo_at" ON "alertas"("id_sensor", "se_activo_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "sensor_umbral_id_sensor_parametro_nombre_key" ON "sensor_umbral"("id_sensor", "parametro_nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_username_key" ON "usuarios"("username");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "idx_usuarios_email" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "idx_usuarios_username" ON "usuarios"("username");

-- CreateIndex
CREATE INDEX "idx_logs_fecha" ON "logs_actividad"("created_at");

-- CreateIndex
CREATE INDEX "idx_logs_usuario" ON "logs_actividad"("id_usuario");

-- CreateIndex
CREATE INDEX "idx_recorridos_sensor_fecha" ON "recorridos_guardados"("id_sensor", "fecha_recorrido");

-- CreateIndex
CREATE UNIQUE INDEX "preferencias_sistema_id_usuario_key" ON "preferencias_sistema"("id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_api_key_key" ON "api_keys"("api_key");

-- CreateIndex
CREATE INDEX "idx_api_keys_key" ON "api_keys"("api_key");

-- CreateIndex
CREATE INDEX "idx_api_keys_activo" ON "api_keys"("esta_activo");

-- CreateIndex
CREATE INDEX "idx_api_keys_created_by" ON "api_keys"("created_by");

-- CreateIndex
CREATE INDEX "idx_api_keys_id_sensor" ON "api_keys"("id_sensor");

-- AddForeignKey
ALTER TABLE "lecturas" ADD CONSTRAINT "lecturas_id_sensor_fkey" FOREIGN KEY ("id_sensor") REFERENCES "sensores"("id_sensor") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "alertas" ADD CONSTRAINT "alertas_id_sensor_fkey" FOREIGN KEY ("id_sensor") REFERENCES "sensores"("id_sensor") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sensor_umbral" ADD CONSTRAINT "sensor_umbral_id_sensor_fkey" FOREIGN KEY ("id_sensor") REFERENCES "sensores"("id_sensor") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "logs_actividad" ADD CONSTRAINT "logs_actividad_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "recorridos_guardados" ADD CONSTRAINT "recorridos_guardados_id_sensor_fkey" FOREIGN KEY ("id_sensor") REFERENCES "sensores"("id_sensor") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "preferencias_sistema" ADD CONSTRAINT "preferencias_sistema_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "usuarios"("id_usuario") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_id_sensor_fkey" FOREIGN KEY ("id_sensor") REFERENCES "sensores"("id_sensor") ON DELETE CASCADE ON UPDATE NO ACTION;
