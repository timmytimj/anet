DELETE FROM people;
DELETE FROM positions;
DELETE FROM peoplePositions;
DELETE FROM organizations;
DELETE FROM groups;
DELETE FROM poams;
DELETE FROM groupMemberships;
DELETE FROM approvalSteps;
DELETE FROM approvalActions;
DELETE FROM positionRelationships;
DELETE FROM locations;
DELETE FROM reportPeople;
DELETE FROM reports;
DELETE FROM comments;

--Advisors
INSERT INTO people (name, status, role, emailAddress, phoneNumber, rank, biography, domainUsername, createdAt, updatedAt) 
	VALUES ('Jack Jackson', 0, 0, 'foobar@example.com', '123-456-78960', 'OF-9', 'this is a sample biography', 'jack', '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000');
INSERT INTO people (name, status, role, emailAddress, phoneNumber, rank, biography, domainUsername, createdAt, updatedAt) 
	VALUES ('Elizabeth Elizawell', 0, 0, 'liz@example.com', '+1-777-7777', 'Capt', 'elizabeth is a test Advisor', 'elizabeth', '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000');
INSERT INTO people (name, status, role, emailAddress, phoneNumber, rank, biography, domainUsername, createdAt, updatedAt) 
	VALUES ('Bob Bobtown', 0, 0, 'bob@example.com', '+1-444-7324', 'Civ', 'Bob is a test Advisor', 'bob', '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000');
INSERT INTO people (name, status, role, emailAddress, phoneNumber, rank, biography, domainUsername, createdAt, updatedAt) 
	VALUES ('Nick Nicholson', 0, 0, 'nick@example.com', '+1-202-7324', 'CIV', 'Is the System Administrator', 'nick', '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000');
INSERT INTO people (name, status, role, emailAddress, phoneNumber, rank, biography, domainUsername, createdAt, updatedAt) 
	VALUES ('Reina Reanton', 0, 0, 'reina@example.com', '+42-233-7324', 'CIV', 'Is the EF1 Super User', 'reina', '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000');

--Principals
INSERT INTO people (name, status, role, emailAddress, phoneNumber, rank, biography, createdAt, updatedAt) 
	VALUES ('Steve Steveson', 0, 1, 'steve@example.com', '+011-232-12324', 'LtCol', 'this is a sample person who could be a Principal!', '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000');
INSERT INTO people (name, status, role, emailAddress, phoneNumber, rank, biography, createdAt, updatedAt) 
	VALUES ('Roger Rogewell', 0, 1, 'roger@example.com', '+1-412-7324', 'Maj', 'Roger is another test person we have in the database', '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000');
INSERT INTO people (name, status, role, emailAddress, phoneNumber, rank, biography, createdAt, updatedAt) 
	VALUES ('Henry Henderson', 0, 1, 'henry@example.com', '+2-456-7324', 'BGen', 'Henry is another test Principal we have in the database', '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000');
INSERT INTO people (name, status, role, emailAddress, phoneNumber, rank, biography, createdAt, updatedAt) 
	VALUES ('Hunter Huntman', 0, 1, 'hunter@example.com', '+1-412-9314', 'CIV', '', '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000');
INSERT INTO people (name, status, role, emailAddress, phoneNumber, rank, biography, createdAt, updatedAt) 
	VALUES ('Andrew Anderson', 0, 1, 'andrew@example.com', '+1-412-7324', 'CIV', '', '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000');
INSERT INTO people (name, status, role, emailAddress, phoneNumber, rank, biography, createdAt, updatedAt) 
	VALUES ('Shardul Sharton', 0, 1, 'shardul@example.com', '+99-9999-9999', 'CIV', '', '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000');

INSERT INTO positions (name, type, currentPersonId, createdAt, updatedAt) VALUES ('EF1 Advisor 04532', 0, NULL, '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000');
INSERT INTO positions (name, type, currentPersonId, createdAt, updatedAt) VALUES ('EF2 Advisor 4987', 0, NULL, '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000');
INSERT INTO positions (name, type, currentPersonId, createdAt, updatedAt) VALUES ('EF3 Advisor 427', 0, NULL, '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000');
INSERT INTO positions (name, type, currentPersonId, createdAt, updatedAt) VALUES ('EF4 Advisor 3', 0, NULL, '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000');

-- Put Bob into the Super User Billet in EF1
INSERT INTO peoplePositions (positionId, personId, createdAt) VALUES 
	((SELECT id from positions where name = 'EF1 SuperUser'), (SELECT id from people where emailAddress = 'bob@example.com'), CURRENT_TIMESTAMP);
UPDATE positions SET currentPersonId = (SELECT id from people where emailAddress = 'bob@example.com') WHERE name = 'EF1 SuperUser';

-- Put Henry into the Super User Billet in EF2
INSERT INTO peoplePositions (positionId, personId, createdAt) VALUES 
	((SELECT id from positions where name = 'EF2 SuperUser'), (SELECT id from people where emailAddress = 'henry@example.com'), CURRENT_TIMESTAMP);
UPDATE positions SET currentPersonId = (SELECT id from people where emailAddress = 'henry@example.com') WHERE name = 'EF2 SuperUser';

-- Rotate an advisor through a billet ending up with Jack in the EF2 Advisor Billet
INSERT INTO peoplePositions (positionId, personId, createdAt) VALUES
	((SELECT id from positions where name = 'EF2 Advisor 4987'), (SELECT id from people where emailAddress = 'reina@example.com'), CURRENT_TIMESTAMP);
UPDATE positions SET currentPersonId = (SELECT id from people where emailAddress = 'reina@example.com') WHERE name = 'EF2 Advisor 4987';
INSERT INTO peoplePositions (positionId, personId, createdAt) VALUES
	((SELECT id from positions where name = 'EF2 Advisor 4987'), (SELECT id from people where emailAddress = 'foobar@example.com'), CURRENT_TIMESTAMP);
UPDATE positions SET currentPersonId = (SELECT id from people where emailAddress = 'foobar@example.com') WHERE name = 'EF2 Advisor 4987';

-- Put Elizabeth into the EF1 Advisor Billet
INSERT INTO peoplePositions (positionId, personId, createdAt) VALUES 
	((SELECT id from positions where name = 'EF1 Advisor 04532'), (SELECT id from people where emailAddress = 'liz@example.com'), CURRENT_TIMESTAMP);
UPDATE positions SET currentPersonId = (SELECT id from people where emailAddress = 'liz@example.com') WHERE name = 'EF1 Advisor 04532';

-- Put Reina into the EF3 Advisor Billet
INSERT INTO peoplePositions (positionId, personId, createdAt) VALUES 
	((SELECT id from positions where name = 'EF3 Advisor 427'), (SELECT id from people where emailAddress = 'reina@example.com'), CURRENT_TIMESTAMP);
UPDATE positions SET currentPersonId = (SELECT id from people where emailAddress = 'reina@example.com') WHERE name = 'EF3 Advisor 427';


INSERT INTO organizations (name, type, createdAt, updatedAt) VALUES ('EF1', 0, '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000');
INSERT INTO organizations (name, type, createdAt, updatedAt) VALUES ('EF2', 0, '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000');
INSERT INTO organizations (name, type, createdAt, updatedAt) VALUES ('EF3', 0, '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000');
INSERT INTO organizations (name, type, createdAt, updatedAt) VALUES ('EF4', 0, '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000');
	INSERT INTO organizations (name, type, parentOrgId) VALUES ('EF 4.1', 0 , (SELECT id FROM organizations WHERE name = 'EF4'));
	INSERT INTO organizations (name, type, parentOrgId) VALUES ('EF 4.2', 0 , (SELECT id FROM organizations WHERE name = 'EF4'));
	INSERT INTO organizations (name, type, parentOrgId) VALUES ('EF 4.3', 0 , (SELECT id FROM organizations WHERE name = 'EF4'));
	INSERT INTO organizations (name, type, parentOrgId) VALUES ('EF 4.4', 0 , (SELECT id FROM organizations WHERE name = 'EF4'));
INSERT INTO organizations (name, type, createdAt, updatedAt) VALUES ('EF5', 0, '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000');
INSERT INTO organizations (name, type, createdAt, updatedAt) VALUES ('EF6', 0, '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000');
INSERT INTO organizations (name, type, createdAt, updatedAt) VALUES ('EF7', 0, '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000');
INSERT INTO organizations (name, type, createdAt, updatedAt) VALUES ('EF8', 0, '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000');
INSERT INTO organizations (name, type, createdAt, updatedAt) VALUES ('Gender', 0, '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000');
INSERT INTO organizations (name, type, createdAt, updatedAt) VALUES ('TAAC-N', 0, '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000');
INSERT INTO organizations (name, type, createdAt, updatedAt) VALUES ('TAAC-S', 0, '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000');
INSERT INTO organizations (name, type, createdAt, updatedAt) VALUES ('TAAC-W', 0, '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000');
INSERT INTO organizations (name, type, createdAt, updatedAt) VALUES ('TAAC-E', 0, '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000');
INSERT INTO organizations (name, type, createdAt, updatedAt) VALUES ('TAAC-C', 0, '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000');
INSERT INTO organizations (name, type, createdAt, updatedAt) VALUES ('TAAC Air', 0, '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000');

UPDATE positions SET organizationId = (SELECT id FROM organizations WHERE name ='EF1') WHERE name LIKE 'EF1%';
UPDATE positions SET organizationId = (SELECT id FROM organizations WHERE name ='EF2') WHERE name LIKE 'EF2%';
UPDATE positions SET organizationId = (SELECT id FROM organizations WHERE name ='EF3') WHERE name LIKE 'EF3%';
UPDATE positions SET organizationId = (SELECT id FROM organizations WHERE name ='EF4') WHERE name LIKE 'EF4%';

INSERT INTO groups (name, createdAt) VALUES ('EF1 Approvers', '2016-11-28 04:00:00.000 +0000');
INSERT INTO approvalSteps (approverGroupId, advisorOrganizationId) VALUES 
	((SELECT id from groups WHERE name = 'EF1 Approvers'), (SELECT id from organizations where name='EF1'));
INSERT INTO groupMemberships (groupId, personId) VALUES 
	((SELECT id from groups WHERE name='EF1 Approvers'), (SELECT id from people where emailAddress = 'henry@example.com'));


INSERT INTO poams (shortName, longName, category, createdAt, updatedAt)	VALUES ('EF1', 'Budget and Planning', 'EF', '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000');
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId) 
	VALUES ('EF1.1', 'Budgeting in the MoD', 'Sub-EF', '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000', (SELECT id from poams where shortName = 'EF1'));
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId) 
	VALUES ('1.1.A', 'Milestone the First in EF1.1', 'Milestone', '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000', (SELECT id from poams where shortName = 'EF1.1'));
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId) 
	VALUES ('1.1.B', 'Milestone the Second in EF1.1', 'Milestone', '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000', (SELECT id from poams where shortName = 'EF1.1'));
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId) 
	VALUES ('1.1.C', 'Milestone the Third in EF1.1', 'Milestone', '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000', (SELECT id from poams where shortName = 'EF1.1'));

INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId) 
	VALUES ('EF1.2', 'Budgeting in the MoI', 'Sub-EF', '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000', (SELECT id from poams where shortName = 'EF1'));
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId) 
	VALUES ('1.2.A', 'Milestone the First in EF1.2', 'Milestone', '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000', (SELECT id from poams where shortName = 'EF1.2'));
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId) 
	VALUES ('1.2.B', 'Milestone the Second in EF1.2', 'Milestone', '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000', (SELECT id from poams where shortName = 'EF1.2'));
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId) 
	VALUES ('1.2.C', 'Milestone the Third in EF1.2', 'Milestone', '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000', (SELECT id from poams where shortName = 'EF1.2'));

INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId) 
	VALUES ('EF1.3', 'Budgeting in the Police?', 'Sub-EF', '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000', (SELECT id from poams where shortName = 'EF1'));
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId) 
	VALUES ('1.3.A', 'Getting a budget in place', 'Milestone', '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000', (SELECT id from poams where shortName = 'EF1.3'));
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId) 
	VALUES ('1.3.B', 'Tracking your expenses', 'Milestone', '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000', (SELECT id from poams where shortName = 'EF1.3'));
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId) 
	VALUES ('1.3.C', 'Knowing when you run out of money', 'Milestone', '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000', (SELECT id from poams where shortName = 'EF1.3'));

INSERT INTO poams (shortName, longName, category, createdAt, updatedAt) VALUES ('EF2', 'Transparency, Accountability, O (TAO)', 'EF', '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000');
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId) 
	VALUES ('2.A', 'This is the first Milestone in EF2', 'Milestone', '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000', (SELECT id from poams where shortName = 'EF2'));
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId) 
	VALUES ('2.B', 'This is the second Milestone in EF2', 'Milestone', '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000', (SELECT id from poams where shortName = 'EF2'));
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt, parentPoamId) 
	VALUES ('2.C', 'This is the third Milestone in EF2', 'Milestone', '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000', (SELECT id from poams where shortName = 'EF2'));

INSERT INTO poams (shortName, longName, category, createdAt, updatedAt) VALUES ('EF3', 'Rule of Law', 'EF', '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000');
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt) VALUES ('EF4', 'Force Gen (Training)', 'EF', '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000');
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt) VALUES ('EF5', 'Force Sustainment (Logistics)', 'EF', '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000');
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt) VALUES ('EF6', 'C2 Operations', 'EF', '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000');
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt) VALUES ('EF7', 'Intelligence', 'EF', '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000');
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt) VALUES ('EF8', 'Stratcom', 'EF', '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000');
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt) VALUES ('Gender', '', 'EF', '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000');
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt) VALUES ('TAAC-N', '', 'EF', '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000');
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt) VALUES ('TAAC-S', '', 'EF', '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000');
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt) VALUES ('TAAC-E', '', 'EF', '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000');
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt) VALUES ('TAAC-W', '', 'EF', '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000');
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt) VALUES ('TAAC-C', '', 'EF', '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000');
INSERT INTO poams (shortName, longName, category, createdAt, updatedAt) VALUES ('TAAC Air', '', 'EF', '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000');

INSERT INTO locations (name, lat, lng) VALUES('St Johns Airport', 47.613442, -52.740936);
INSERT INTO locations (name, lat, lng) VALUES('Murray''s Hotel', 47.561517, -52.708760);
INSERT INTO locations (name, lat, lng) VALUES('Wishingwells Park', 47.560040, -52.736962);
INSERT INTO locations (name, lat, lng) VALUES('General Hospital', 47.571772, -52.741935);
INSERT INTO locations (name, lat, lng) VALUES('Portugal Cove Ferry Terminal', 47.626718, -52.857241);
INSERT INTO locations (name, lat, lng) VALUES('Cabot Tower', 47.570010, -52.681770);
INSERT INTO locations (name, lat, lng) VALUES('Fort Amherst', 47.563763, -52.680590);
INSERT INTO locations (name, lat, lng) VALUES('Harbour Grace Police Station', 47.705133, -53.214422);
INSERT INTO locations (name, lat, lng) VALUES('Conception Bay South Police Station', 47.526784, -52.954739);
INSERT INTO locations (name) VALUES ('MoD Headquarters Kabul');
INSERT INTO locations (name) VALUES ('MoI Headquarters Kabul');
INSERT INTO locations (name) VALUES ('President''s Palace');
INSERT INTO locations (name) VALUES ('Kabul Police Academy');
INSERT INTO locations (name) VALUES ('Police HQ Training Facility');
INSERT INTO locations (name) VALUES ('Kabul Hospital');
INSERT INTO locations (name) VALUES ('MoD Army Training Base 123');
INSERT INTO locations (name) VALUES ('MoD Location the Second');
INSERT INTO locations (name) VALUES ('MoI Office Building ABC');

INSERT INTO organizations (name, type, createdAt, updatedAt) VALUES ('Ministry of Defense', 1, '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000');
INSERT INTO organizations (name, type, createdAt, updatedAt) VALUES ('Ministry of Interior', 1, '2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000');

INSERT INTO positions (name, code, type, currentPersonId, organizationId ) VALUES ('Minister of Defense', 'MOD-FO-00001', 1, NULL, (SELECT id FROM organizations WHERE name ='Ministry of Defense'));
INSERT INTO positions (name, code, type, currentPersonId, organizationId) VALUES ('Chief of Staff - MoD', 'MOD-FO-00002', 1, NULL, (SELECT id FROM organizations WHERE name ='Ministry of Defense'));
INSERT INTO positions (name, code, type, currentPersonId, organizationId) VALUES ('Executive Assistant to the MoD', 'MOD-FO-00003', 1, NULL, (SELECT id FROM organizations WHERE name ='Ministry of Defense'));
INSERT INTO positions (name, code, type, currentPersonId, organizationId) VALUES ('Director of Budgeting - MoD', 'MOD-Bud-00001', 1, NULL, (SELECT id FROM organizations WHERE name ='Ministry of Defense'));
INSERT INTO positions (name, code, type, currentPersonId, organizationId) VALUES ('Writer of Expenses - MoD', 'MOD-Bud-00002', 1, NULL, (SELECT id FROM organizations WHERE name ='Ministry of Defense'));
INSERT INTO positions (name, code, type, currentPersonId, organizationId) VALUES ('Cost Adder - MoD', 'MOD-Bud-00003', 1, NULL, (SELECT id FROM organizations WHERE name ='Ministry of Defense'));
INSERT INTO positions (name, code, type, currentPersonId, organizationId) VALUES ('Chief of Police', 'MOI-Pol-HQ-00001',1, NULL, (SELECT id FROM organizations WHERE name ='Ministry of Interior'));

-- Put Steve into a Tashkil and associate with the EF1 Advisor Billet
INSERT INTO peoplePositions (positionId, personId, createdAt) VALUES 
	((SELECT id from positions where name = 'Cost Adder - MoD'), (SELECT id from people where emailAddress = 'steve@example.com'), '2016-11-28 04:00:00.000 +0000');
UPDATE positions SET currentPersonId = (SELECT id from people where emailAddress = 'steve@example.com') WHERE name = 'Cost Adder - MoD';
INSERT INTO positionRelationships (positionId_a, positionId_b, createdAt, updatedAt, deleted) VALUES
	((SELECT id from positions WHERE name ='EF1 Advisor 04532'), 
	(SELECT id FROM positions WHERE name='Cost Adder - MoD'), 
	'2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000', 0);

-- But Roger in a Tashkil and associate with the EF2 advisor billet
INSERT INTO peoplePositions (positionId, personId, createdAt) VALUES 
	((SELECT id from positions where name = 'Chief of Police'), (SELECT id from people where emailAddress = 'roger@example.com'), '2016-11-28 04:00:00.000 +0000');
UPDATE positions SET currentPersonId = (SELECT id from people where emailAddress = 'roger@example.com') WHERE name = 'Chief of Police';
INSERT INTO positionRelationships (positionId_a, positionId_b, createdAt, updatedAt, deleted) VALUES
	((SELECT id from positions WHERE name ='Chief of Police'), 
	(SELECT id FROM positions WHERE name='EF2 Advisor 4987'), 
	'2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000', 0);

INSERT INTO reports (createdAt, updatedAt, locationId, intent, text, nextSteps, authorId, state, engagementDate, atmosphere) VALUES
	('2016-11-28 04:00:00.000 +0000', '2016-11-28 04:00:00.000 +0000', (SELECT id from locations where name='General Hospital'), 'Discuss improvements in Annual Budgeting process',
	'Today I met with this dude to tell him all the great things that he can do to improve his budgeting process. I hope he listened to me',
	'Meet with the dude again next week',
	(SELECT id FROM people where emailAddress='foobar@example.com'), 0, '2016-11-28 04:00:00.000 +0000', 0);
INSERT INTO reportPeople (personId, reportId, isPrimary) VALUES (
	(SELECT id FROM people where emailAddress='steve@example.com'),
	(SELECT id FROM reports where createdAt = '2016-11-28 04:00:00.000 +0000'), 1);

--Create the default Approval Group
INSERT INTO groups (name, createdAt) VALUES ('Default Approvers', '2016-11-28 04:00:00:00.000 +0000');
INSERT INTO groupMemberships (groupId, personId) VALUES ((SELECT id from groups where name = 'Default Approvers'), (SELECT id from people where emailAddress='nick@example.com'));
INSERT INTO approvalSteps (approverGroupId, advisorOrganizationId) VALUES ((SELECT id from groups where name = 'Default Approvers'), -1);

