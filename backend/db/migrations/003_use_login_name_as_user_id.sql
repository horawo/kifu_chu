-- Existing installations originally stored the login name in username and a generated value in user_id.
-- Move those login names into user_id so username can be used as the editable display name.
ALTER TABLE t_user DROP INDEX username;

SET FOREIGN_KEY_CHECKS = 0;

UPDATE t_kifu k
JOIN t_user u ON k.user_id = u.user_id
SET k.user_id = u.username
WHERE u.user_id REGEXP '^user_[0-9a-f]{13}\\.' OR u.user_id = 'user_test_default';

UPDATE t_initial i
JOIN t_user u ON i.user_id = u.user_id
SET i.user_id = u.username
WHERE u.user_id REGEXP '^user_[0-9a-f]{13}\\.' OR u.user_id = 'user_test_default';

UPDATE t_user
SET user_id = username
WHERE user_id REGEXP '^user_[0-9a-f]{13}\\.' OR user_id = 'user_test_default';

SET FOREIGN_KEY_CHECKS = 1;
