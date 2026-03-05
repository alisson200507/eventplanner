DROP DATABASE IF EXISTS eventplanner;
CREATE DATABASE eventplanner CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE eventplanner;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  rol ENUM('Organizador General','Organizador Evento','Organizador Personal') NOT NULL,
  pin VARCHAR(10) NOT NULL,
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
  codigo_qr VARCHAR(100),
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

INSERT INTO usuarios (nombre, rol, pin, avatar) VALUES
('Mari', 'Organizador General', '1234', 'M'),
('Carlos', 'Organizador Evento', '1234', 'C'),
('Ana', 'Organizador Personal', '1234', 'A');

INSERT INTO eventos (nombre, fecha, hora, lugar, direccion, capacidad, presupuesto, organizador_id, estado, descripcion) VALUES
('Baile de Fin de Año', '2025-12-31', '19:00:00', 'Salón Real', 'Av. Principal 123', 200, 80000, 1, 'proximo', 'Celebración de fin de año'),
('Boda de Laura & Felipe', '2025-02-05', '19:00:00', 'Jardín Azul', 'Calz. Flores 45', 150, 120000, 1, 'proximo', 'Ceremonia y recepción nupcial'),
('Concierto de Rock', '2025-09-25', '21:00:00', 'Estadio OE', 'Blvd. Sur 890', 5000, 250000, 2, 'proximo', 'Concierto con bandas invitadas');

INSERT INTO invitados (nombre, apellido, email, telefono, evento_id, rsvp, asistencia) VALUES
('Felipe', 'Martínez', 'felipe@email.com', '+52 55 1111 2222', 2, 'confirmado', 'asistio'),
('Laura', 'Domínguez', 'laura@email.com', '+52 55 3333 4444', 2, 'pendiente', 'no_registrada'),
('Andrea', 'Gómez', 'andrea@email.com', '+52 55 5555 6666', 1, 'pendiente', 'no_registrada'),
('Ricardo', 'Pérez', 'ricardo@email.com', '+52 55 7777 8888', 3, 'confirmado', 'no_registrada');

INSERT INTO presupuestos (evento_id, categoria, presupuesto, gastado, proveedor, notas) VALUES
(2, 'Catering', 20000, 18500, 'Banquetes El Rey', 'Incluye mesa de dulces'),
(2, 'Decoración', 15000, 15000, 'Flores & Estilo', ''),
(2, 'Música', 13500, 10000, 'Mariachi Los Reyes', 'Pago pendiente 50%'),
(1, 'Catering', 30000, 0, 'Chef Carlos', ''),
(3, 'Sonido', 80000, 40000, 'Sound Pro', '');