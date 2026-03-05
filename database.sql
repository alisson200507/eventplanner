DROP DATABASE IF EXISTS railway;
CREATE DATABASE railway CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE railway;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  rol ENUM('Organizador General','Organizador Evento','Organizador Personal') NOT NULL,
  pin VARCHAR(10) NOT NULL,
  email VARCHAR(200) UNIQUE,
  password VARCHAR(200),
  avatar VARCHAR(5) DEFAULT 'U',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE eventos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  fecha DATE NOT NULL,
  hora TIME,
  lugar VARCHAR(200),
  direccion VARCHAR(300),
  notas_lugar TEXT,
  capacidad INT DEFAULT 0,
  presupuesto DECIMAL(12,2) DEFAULT 0,
  organizador_id INT,
  estado ENUM('proximo','en_curso','concluido','cancelado') DEFAULT 'proximo',
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organizador_id) REFERENCES usuarios(id)
);

CREATE TABLE invitados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100),
  email VARCHAR(200) NOT NULL,
  telefono VARCHAR(30),
  evento_id INT NOT NULL,
  rsvp ENUM('pendiente','confirmado','cancelado') DEFAULT 'pendiente',
  asistencia ENUM('no_registrada','asistio','no_asistio') DEFAULT 'no_registrada',
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE
);

CREATE TABLE presupuestos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  evento_id INT NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  presupuesto DECIMAL(12,2) DEFAULT 0,
  gastado DECIMAL(12,2) DEFAULT 0,
  proveedor VARCHAR(200),
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE
);

-- Usuarios con correo y contraseña
INSERT INTO usuarios (nombre, rol, pin, email, password, avatar) VALUES
('Mari', 'Organizador General', '1234', 'mari@eventplanner.com', '1234', 'M'),
('Carlos', 'Organizador Evento', '1234', 'carlos@eventplanner.com', '1234', 'C'),
('Ana', 'Organizador Personal', '1234', 'ana@eventplanner.com', '1234', 'A');