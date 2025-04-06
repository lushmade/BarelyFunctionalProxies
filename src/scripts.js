async function fillDropdown() {
  const url = "https://api.lorcast.com/v0/sets"
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const sets = await response.json()
    for (const set of sets["results"]) {
      if (Number.isInteger(parseInt(set.code))) {
        await fillDropdownForSet(set.code)
      }
    }

  } catch (error) {
    console.error(error.message);
  }
}

const nameToInfoMap = {}

async function fillDropdownForSet(setno) {
  const url = `https://api.lorcast.com/v0/sets/${setno}/cards`
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const cards = await response.json()
    for (const card of cards) {
      if (card.rarity === "Enchanted") { continue; }
      let name = card.name
      if (card.version !== "") {
        name += " - " + card.version
      }
      $("#card-names").append( `<option value="${name}">`)
      nameToInfoMap[name] = { set: setno, card: card.collector_number }
    }

  } catch (error) {
    console.error(error.message);
  }
}

function datalistChanged() {
  let selected = $("#card-names-input").val()
  let data = nameToInfoMap[selected]
  fillCard(data.set, data.card)
}

async function fillCard(setno, cardno) {
  const url = `https://api.lorcast.com/v0/cards/${setno}/${cardno}`
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const card = await response.json();
    $("#card-ink").text(card.cost);
    $("#card-title").text(card.name);
    $("#card-subtitle").text(card.version);
    $("#card-strength").text(card.strength);
    $("#card-willpower").text(card.willpower);
    if (card.inks !== null) {
      $("#card-ink-one").css('background-color', colorForInk(card.inks[0]))
      $("#card-ink-two").css('background-color', colorForInk(card.inks[1]))
    } else {
      $("#card-ink-one").css('background-color', colorForInk(card.ink))
      $("#card-ink-two").css('background-color', "white")
    }
    $("#card-keywords").text(card.classifications.join(" • "));
    let textlines = card.text.split("\n")
    $("#card-text").empty()
    for (let textline of textlines) {
      let text = textline.replace("{I}", "<img src='../assets/Ink.png'/>")
      text = text.replace("{S}", "<img src='../assets/Strength.png'/>")
      text = text.replace("{W}", "<img src='../assets/Willpower.png'/>")
      $("#card-text").append(`<p>${text}</p>`);
    }
    $("#card-rarity").empty()
    $("#card-rarity").append(`<img src='../assets/Rarity/${card.rarity}.png'/>`)
    $("#card-artist").text(card.illustrators.join(" • "))
    $("#card-set-info").text(`${card.collector_number}/204 • Set ${card.set.code} `);
    $("#card-art").css('background-image', `url("../assets/CardArt/0${card.set.code}_${card.collector_number}.png`)
    if (card.inkwell) {
      $("#card").css('background-image', "url('../assets/Background/inkable_lorcana_drawn.jpg')")
    } else {
      $("#card").css('background-image', "url('../assets/Background/uninkable_lorcana_drawn.jpg')")
    }
    $("#card-lore").empty();
    for (var i=0; i<card.lore; i++) {
      $("#card-lore").append("<div class='lore-symbol'></div>")
    }
    console.log(card);
  } catch (error) {
    console.error(error.message);
  }
}

function colorForInk(ink) {
  switch (ink) {
    case "Amber": return "#f5b306";
    case "Amethyst": return "#81377a";
    case "Emerald": return "#2a8a36";
    case "Ruby": return "#d20930";
    case "Sapphire": return "#018bc0";
    case "Steel": return "#9fa9b3";
    default: return "white;"
  }
}

document.getElementById("card-names-input")
  .addEventListener("change", datalistChanged);

fillDropdown()