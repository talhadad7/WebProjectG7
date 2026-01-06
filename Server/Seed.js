    const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(__dirname, "db.sqlite");
const db = new sqlite3.Database(dbPath);

const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");

// products from your current script.js
const PRODUCTS = [
  {
    id: "GarlicHerb",
    name: "Garlic & Herb Butter",
    flavor: "Fresh garlic, parsley & thyme",
    description: "A classic savory butter, perfect for bread, pasta and roasted veggies.",
    price: 29,
    weight: 150,
    image: "Images/GarlicHerbButter.png",
    alt: "Garlic and herb flavored butter",
    popularity: 2
  },
  {
    id: "HoneySeaSalt",
    name: "Honey & Sea Salt Butter",
    flavor: "Wild honey & sea salt crystals",
    description: "Soft, sweet and slightly salty – perfect for brunch and desserts.",
    price: 32,
    weight: 150,
    image: "Images/HoneySaltButter.png",
    alt: "Honey and sea salt flavored butter",
    popularity: 9
  },
  {
    id: "SmokedPaprika",
    name: "Smoked Paprika Butter",
    flavor: "Smoked paprika & roasted garlic",
    description: "Rich and smoky flavor that upgrades any grilled dish or steak.",
    price: 31,
    weight: 150,
    image: "Images/PaprikaButter.png",
    alt: "Smoked paprika flavored butter",
    popularity: 3
  },
  {
    id: "LemonDill",
    name: "Lemon & Dill Butter",
    flavor: "Lemon zest & fresh dill",
    description: "Bright and fresh, ideal for fish, veggies and light dishes.",
    price: 30,
    weight: 150,
    image: "Images/LemonDillButter.png",
    alt: "Lemon and dill flavored butter",
    popularity: 4
  },
  {
    id: "ChiliAnchovy",
    name: "Chili & Anchovy Butter",
    flavor: "Chili flakes, anchovy & herbs",
    description: "A bold, umami-packed butter with a spicy kick—amazing on pasta, toast and grilled fish.",
    price: 34,
    weight: 150,
    image: "Images/ChiliAnchovyButter.png",
    alt: "Chili and anchovy flavored butter slices on a wooden board",
    popularity: 5
  },
  {
    id: "CaramelizedOnion",
    name: "Caramelized Onion Butter",
    flavor: "Slow-cooked caramelized onions",
    description: "Sweet and savory butter with rich onion depth—perfect for steaks, burgers, mashed potatoes and toast.",
    price: 33,
    weight: 150,
    image: "Images/CaramelizedOnionButter.png",
    alt: "Caramelized onion flavored butter slices on a wooden board",
    popularity: 6
  },
  {
    id: "BrownButterCinnamonVanilla",
    name: "Brown Butter with Cinnamon, Vanilla & Brown Sugar",
    flavor: "Brown butter, cinnamon, vanilla & brown sugar",
    description: "Warm, nutty and dessert-ready—spread on pancakes, waffles, banana bread or warm brioche.",
    price: 35,
    weight: 150,
    image: "Images/BrownButterCinnamonVanilla.png",
    alt: "Brown butter with cinnamon and vanilla slices on a wooden board",
    popularity: 7
  }
];

db.exec(schema, (err) => {
  if (err) throw err;

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO products
    (id, name, flavor, description, price, weight, image, alt, popularity)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const p of PRODUCTS) {
    stmt.run(p.id, p.name, p.flavor, p.description, p.price, p.weight, p.image, p.alt, p.popularity);
  }
    
  stmt.finalize(() => {
    console.log("✅ DB created and products inserted: server/db.sqlite");
    db.close();
  });
});
