USE butterlab;

-- Optional: clear products before seeding (so it won't duplicate)
DELETE FROM products;

INSERT INTO products
(id, name, flavor, description, price, weight, image, alt, popularity)
VALUES
('GarlicHerb',
 'Garlic & Herb Butter',
 'Fresh garlic, parsley & thyme',
 'A classic savory butter, perfect for bread, pasta and roasted veggies.',
 29,
 150,
 'Images/GarlicHerbButter.png',
 'Garlic and herb flavored butter',
 2),

('HoneySeaSalt',
 'Honey & Sea Salt Butter',
 'Wild honey & sea salt crystals',
 'Soft, sweet and slightly salty - perfect for brunch and desserts.',
 32,
 150,
 'Images/HoneySaltButter.png',
 'Honey and sea salt flavored butter',
 9),

('SmokedPaprika',
 'Smoked Paprika Butter',
 'Smoked paprika & roasted garlic',
 'Rich and smoky flavor that upgrades any grilled dish or steak.',
 31,
 150,
 'Images/PaprikaButter.png',
 'Smoked paprika flavored butter',
 3),

('LemonDill',
 'Lemon & Dill Butter',
 'Lemon zest & fresh dill',
 'Bright and fresh, ideal for fish, veggies and light dishes.',
 30,
 150,
 'Images/LemonDillButter.png',
 'Lemon and dill flavored butter',
 4),

('ChiliAnchovy',
 'Chili & Anchovy Butter',
 'Chili flakes, anchovy & herbs',
 'A bold, umami-packed butter with a spicy kick - amazing on pasta, toast and grilled fish.',
 34,
 150,
 'Images/ChiliAnchovyButter.png',
 'Chili and anchovy flavored butter slices on a wooden board',
 5),

('CaramelizedOnion',
 'Caramelized Onion Butter',
 'Slow-cooked caramelized onions',
 'Sweet and savory butter with rich onion depth - perfect for steaks, burgers, mashed potatoes and toast.',
 33,
 150,
 'Images/CaramelizedOnionButter.png',
 'Caramelized onion flavored butter slices on a wooden board',
 6),

('BrownButterCinnamonVanilla',
 'Brown Butter with Cinnamon, Vanilla & Brown Sugar',
 'Brown butter, cinnamon, vanilla & brown sugar',
 'Warm, nutty and dessert-ready - spread on pancakes, waffles, banana bread or warm brioche.',
 35,
 150,
 'Images/BrownButterCinnamonVanilla.png',
 'Brown butter with cinnamon and vanilla slices on a wooden board',
 7);
