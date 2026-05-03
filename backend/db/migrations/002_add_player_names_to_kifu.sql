-- Add sente_name and gote_name to t_kifu
ALTER TABLE t_kifu ADD COLUMN sente_name VARCHAR(255) DEFAULT '先手';
ALTER TABLE t_kifu ADD COLUMN gote_name VARCHAR(255) DEFAULT '後手';
