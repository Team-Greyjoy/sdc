CREATE TABLE Reviews (
 review_id BIGSERIAL,
 product_id INTEGER,
 rating INTEGER,
 summary TEXT,
 recommend BOOLEAN,
 response TEXT,
 body TEXT,
 reviewer_name VARCHAR,
 helpfulness INTEGER,
 report BOOLEAN
);


ALTER TABLE Reviews ADD CONSTRAINT Reviews_pkey PRIMARY KEY (review_id);

CREATE TABLE Photos (
 photo_id BIGSERIAL,
 review_id INTEGER,
 url VARCHAR
);


ALTER TABLE Photos ADD CONSTRAINT Photos_pkey PRIMARY KEY (photo_id);

CREATE TABLE Chars (
 char_id BIGSERIAL,
 product_id INTEGER,
 name TEXT
);


ALTER TABLE Chars ADD CONSTRAINT Chars_pkey PRIMARY KEY (char_id);

CREATE TABLE Reviews_Chars (
 id BIGSERIAL,
 review_id INTEGER,
 char_id INTEGER,
 value INTEGER
);


ALTER TABLE Reviews_Chars ADD CONSTRAINT Reviews_Chars_pkey PRIMARY KEY (id);