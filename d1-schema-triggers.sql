-- Triggers for Timestamp Management

CREATE TRIGGER IF NOT EXISTS update_rooms_updated_at 
AFTER UPDATE ON rooms
FOR EACH ROW
BEGIN
  UPDATE rooms SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_guests_updated_at 
AFTER UPDATE ON guests
FOR EACH ROW
BEGIN
  UPDATE guests SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_bookings_updated_at 
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
  UPDATE bookings SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_contact_messages_updated_at 
AFTER UPDATE ON contact_messages
FOR EACH ROW
BEGIN
  UPDATE contact_messages SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_pet_care_requests_updated_at 
AFTER UPDATE ON pet_care_requests
FOR EACH ROW
BEGIN
  UPDATE pet_care_requests SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_reviews_updated_at 
AFTER UPDATE ON reviews
FOR EACH ROW
BEGIN
  UPDATE reviews SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_auth_users_updated_at 
AFTER UPDATE ON auth_users
FOR EACH ROW
BEGIN
  UPDATE auth_users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
