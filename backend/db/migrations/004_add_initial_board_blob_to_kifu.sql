-- Store each kifu's starting board separately from the move text.
ALTER TABLE t_kifu ADD COLUMN initial_blob_id INT NULL AFTER kifu_blob_id;
ALTER TABLE t_kifu ADD CONSTRAINT fk_t_kifu_initial_blob FOREIGN KEY (initial_blob_id) REFERENCES t_kifu_blob(id);
