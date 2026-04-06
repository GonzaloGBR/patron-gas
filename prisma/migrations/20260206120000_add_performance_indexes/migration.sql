-- Índices para consultas frecuentes del panel (dashboard, listados, préstamos).
-- Aplicar en producción: `npx prisma migrate deploy`

CREATE INDEX `client_cylinder_loans_updated_at_idx` ON `client_cylinder_loans`(`updated_at`);
CREATE INDEX `client_cylinder_loans_quantity_owed_idx` ON `client_cylinder_loans`(`quantity_owed`);

CREATE INDEX `clients_is_active_created_at_idx` ON `clients`(`is_active`, `created_at`);

CREATE INDEX `orders_status_completed_at_idx` ON `orders`(`status`, `completed_at`);
CREATE INDEX `orders_created_at_idx` ON `orders`(`created_at`);

CREATE INDEX `stock_movements_created_at_idx` ON `stock_movements`(`created_at`);
