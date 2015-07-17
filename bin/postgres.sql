-- camelCase, not snake_case
-- createdAt, updatedAt (don't automate; use `timestamp with time zone` type)

DROP TABLE IF EXISTS orders CASCADE;
CREATE TABLE orders (
    order_id INTEGER CONSTRAINT order_key PRIMARY KEY,
    order_number INTEGER NOT NULL,
    order_key INTEGER NOT NULL,
    order_status VARCHAR,
    weight NUMERIC,
    raw_order_date VARCHAR,
    raw_bill_to VARCHAR,
    raw_advanced_options VARCHAR
);

DROP TABLE IF EXISTS order_items;
CREATE TABLE order_items (
    order_item_id INTEGER CONSTRAINT order_item_key PRIMARY KEY,
    order_id integer REFERENCES orders (order_id),
    sku VARCHAR NOT NULL,
    quantity INTEGER NOT NULL,
    size VARCHAR NOT NULL,
    fabric VARCHAR NOT NULL,
    lookup_key VARCHAR NOT NULL
);

CREATE INDEX order_items_lookup_key_index ON order_items (lookup_key);

CREATE OR REPLACE FUNCTION generate_lookup_key() RETURNS trigger AS $order_items$
    BEGIN
        NEW.lookup_key := NEW.sku || ' ' || NEW.size || ' ' || NEW.fabric;
        RETURN NEW;
    END;
$order_items$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS generate_lookup_key_insert_trigger ON order_items CASCADE;
CREATE TRIGGER generate_lookup_key_insert_trigger BEFORE INSERT ON order_items
    FOR EACH ROW
    EXECUTE PROCEDURE generate_lookup_key();

DROP TRIGGER IF EXISTS generate_lookup_key_update_trigger ON order_items CASCADE;
CREATE TRIGGER generate_lookup_key_update_trigger BEFORE UPDATE ON order_items
    FOR EACH ROW
    WHEN (OLD.sku IS DISTINCT FROM NEW.sku OR OLD.fabric IS DISTINCT FROM NEW.fabric OR OLD.size IS DISTINCT FROM NEW.size)
    EXECUTE PROCEDURE generate_lookup_key();

DROP TYPE IF EXISTS PRODUCT_TYPE CASCADE;
CREATE TYPE PRODUCT_TYPE AS ENUM ('Cover', 'Pillow', 'Insert', 'Sample');

DROP TABLE IF EXISTS products;
CREATE TABLE products (
    lookup_key VARCHAR CONSTRAINT product_key PRIMARY KEY,
    weight NUMERIC NOT NULL,
    type PRODUCT_TYPE NOT NULL,
    volume NUMERIC NOT NULL,
    name VARCHAR
);

DROP TABLE IF EXISTS tags;
CREATE TABLE tags (
    tag_id INTEGER CONSTRAINT tag_key PRIMARY KEY,
    name VARCHAR NOT NULL,
    color CHARACTER(7) NOT NULL
);
