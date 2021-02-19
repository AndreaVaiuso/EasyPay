CREATE USER 'easypay'@'localhost' IDENTIFIED BY 'easypay'; GRANT ALL ON *.*
  TO 'easypay'@'localhost'
  WITH GRANT OPTION;

CREATE SCHEMA ep;

CREATE TABLE `ep`.`user` (
  `email` VARCHAR(256) NOT NULL,
  `name` VARCHAR(45) NOT NULL,
  `surname` VARCHAR(45) NOT NULL,
  `password` VARCHAR(512) NOT NULL,
  `walletAmount` DECIMAL(20,2) NOT NULL,
  `address` VARCHAR(45) NOT NULL,
  `phone` VARCHAR(45) NOT NULL,
  `active` TINYINT(4) NOT NULL,
  `uid` VARCHAR(256) NULL,
  `not_mail` TINYINT(4) NOT NULL,
  `not_whatsapp` TINYINT(4) NOT NULL,
  `not_sms` TINYINT(4) NOT NULL DEFAULT 0,
  PRIMARY KEY (`email`));

CREATE TABLE `ep`.`payment` (
  `date` BIGINT NOT NULL,
  `email1` VARCHAR(256) NOT NULL,
  `email2` VARCHAR(256) NOT NULL,
  `paymentMethod` VARCHAR(45) NOT NULL,
  `causal` VARCHAR(512) NULL,
  `import` DECIMAL(20,2) NOT NULL,
  PRIMARY KEY (`date`, `email1`, `email2`),
  INDEX `email1_idx` (`email1` ASC),
  CONSTRAINT `email`
    FOREIGN KEY (`email1`)
    REFERENCES `ep`.`user` (`email`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE);

CREATE TABLE `ep`.`code` (
  `email` VARCHAR(256) NOT NULL,
  `code` VARCHAR(45) NOT NULL,
  `import` DECIMAL(20,2) NOT NULL,
  PRIMARY KEY (`email`, `code`, `import`),
  CONSTRAINT `creatorEmail`
    FOREIGN KEY (`email`)
    REFERENCES `ep`.`user` (`email`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE);

CREATE TABLE `ep`.`card` (
  `number` VARCHAR(45) NOT NULL,
  `expdate` VARCHAR(45) NOT NULL,
  `secCode` INT NOT NULL,
  `address` VARCHAR(45) NOT NULL,
  `holder` VARCHAR(45) NOT NULL,
  `amount` DECIMAL(20,2) NOT NULL,
  PRIMARY KEY (`number`));

CREATE TABLE `ep`.`bank` (
  `iban` VARCHAR(256) NOT NULL,
  `holder` VARCHAR(45) NOT NULL,
  `amount` DECIMAL(20,2) NOT NULL,
  PRIMARY KEY (`iban`));

CREATE TABLE `ep`.`linkedcard` (
  `email` VARCHAR(256) NOT NULL,
  `cardNumber` VARCHAR(45) NOT NULL,
  `fav` TINYINT(4) NOT NULL,
  PRIMARY KEY (`email`, `cardNumber`),
  INDEX `card_idx` (`cardNumber` ASC),
  CONSTRAINT `card`
    FOREIGN KEY (`cardNumber`)
    REFERENCES `ep`.`card` (`number`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE,
  CONSTRAINT `linkedEmail`
    FOREIGN KEY (`email`)
    REFERENCES `ep`.`user` (`email`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE);

CREATE TABLE `ep`.`linkedbank` (
  `email` VARCHAR(256) NOT NULL,
  `iban` VARCHAR(256) NOT NULL,
  `fav` TINYINT(4) NOT NULL,
  PRIMARY KEY (`email`, `iban`),
  INDEX `bank_idx` (`iban` ASC),
  CONSTRAINT `bank`
    FOREIGN KEY (`iban`)
    REFERENCES `ep`.`bank` (`iban`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE,
  CONSTRAINT `emailLinkedBank`
    FOREIGN KEY (`email`)
    REFERENCES `ep`.`user` (`email`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE);

CREATE TABLE `ep`.`business` (
  `name` VARCHAR(256) NOT NULL,
  PRIMARY KEY (`name`));

CREATE TABLE `ep`.`periodicpayment` (
  `email` VARCHAR(256) NOT NULL,
  `business` VARCHAR(45) NOT NULL,
  `startDate` BIGINT(20) NOT NULL,
  `paymentMethod` VARCHAR(512) NOT NULL,
  `causal` VARCHAR(256) NOT NULL,
  `periodicity` INT NOT NULL,
  `limit` INT NOT NULL,
  `import` DECIMAL(20,2) NOT NULL,
  `lastPaymentDate` BIGINT(20) NOT NULL DEFAULT 0,
  `reminded` TINYINT NULL DEFAULT 0,
  `creationDate` BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (`email`, `business`, `creationDate`),
  INDEX `businessPeriodic_idx` (`startDate` DESC),
  CONSTRAINT `emailPeriodic`
    FOREIGN KEY (`email`)
    REFERENCES `ep`.`user` (`email`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE,
  CONSTRAINT `businessPeriodic`
    FOREIGN KEY (`business`)
    REFERENCES `ep`.`business` (`name`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE);

DELIMITER $$
USE `ep`$$
CREATE DEFINER = CURRENT_USER TRIGGER `ep`.`card_BEFORE_UPDATE` BEFORE UPDATE ON `card` FOR EACH ROW
BEGIN
	IF NEW.amount < 0 THEN
		SIGNAL SQLSTATE '45000';
    END IF;
END$$
DELIMITER ;

DELIMITER $$
USE `ep`$$
CREATE DEFINER = CURRENT_USER TRIGGER `ep`.`bank_BEFORE_UPDATE` BEFORE UPDATE ON `bank` FOR EACH ROW
BEGIN
	IF NEW.amount < 0 THEN
		SIGNAL SQLSTATE '45000';
    END IF;
END$$
DELIMITER ;

DELIMITER $$
USE `ep`$$
CREATE DEFINER = CURRENT_USER TRIGGER `ep`.`user_BEFORE_UPDATE` BEFORE UPDATE ON `user` FOR EACH ROW
BEGIN
	IF NEW.walletAmount < 0 THEN
		SIGNAL SQLSTATE '45000';
    END IF;
END$$
DELIMITER ;

INSERT INTO ep.card VALUES ('4242535364647575','02/22',000,'Via Liguria 7','ANDREA VAIUSO',500);
INSERT INTO ep.card VALUES ('5242535364647575','02/22',001,'Viale Delle Scienze 1','ROBERTO PIRRONE',500);
INSERT INTO ep.bank VALUES ('IT0E123456789','ANDREA VAIUSO',500);
INSERT INTO ep.user VALUES ('andrea.vaiuso@community.unipa.it','Andrea','Vaiuso','4194d1706ed1f408d5e02d672777019f4d5385c766a8c6ca8acba3167d36a7b9',1000.00,'Via Liguria 7','+393345024316',1,0,1,0,0);
INSERT INTO ep.business VALUES ('NETFLIX');
INSERT INTO ep.business VALUES ('AMAZON PRIME');
