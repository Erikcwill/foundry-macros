const selectedToken = canvas.tokens.controlled[0]; // Seleciona o primeiro token controlado na cena

if (selectedToken) {
  const raceName = "Giff"; // Nome da raça
  const feature1 = "Astral Spark";
  const feature2 = "Firearms Mastery";
  const feature3 = "Hippo Build";
  const feature4 = "";
  const asiIconPath = "Assets/iCONS/classFeatures/Improve.jpg"; //Caminho do icone de Improve

  const itemsToAdd = [
    { name: raceName, type: "feat" },
    { name: feature1, type: "feat" },
    { name: feature2, type: "feat" },
    { name: feature3, type: "feat" },
    { name: feature4, type: "feat" },
    // Adicione outros itens desejados aqui
  ];

  const asiAttributeIncrease = {
    str: 0, // Aumento de força
    dex: 0, // Aumento de destreza
    con: 0, // Aumento de constituição
    int: 0, // Aumento de inteligência
    wis: 0, // Aumento de sabedoria
    cha: 0, // Aumento de carisma
  };

  async function createItems() {
    //Itera sobre os itens da Array de itens
    for (const itemInfo of itemsToAdd) {
      const { name, type } = itemInfo;
      //Busca na base do Foundry a existência dos itens com o mesmo nome e tipo dos itens da array
      const itemToAdd = game.items.find(
        (item) => item.name === name && item.type === type
      );
      //Adiciona os itens para a ficha
      if (itemToAdd) {
        const itemData = duplicate(itemToAdd.data);
        await selectedToken.actor.createEmbeddedDocuments("Item", [itemData]);
      }
    }
    //Busca se existe um item de Raça na ficha
    const raceItem = selectedToken.actor.items.find(
      (item) => item.name === raceName && item.type === "feat"
    );
    if (raceItem) {
      // Item 'raceName' encontrado, exibe a mensagem no chat
      chatMsg = `${selectedToken.actor.name} agora é um ${raceName} (:`;
      let chatData = {
        user: game.user._id,
        speaker: ChatMessage.getSpeaker(),
        content: chatMsg,
      };
      ChatMessage.create(chatData, {});
    }
  }

  async function applyASIEffect() {
    // Abre um dialgo para escolha do tipo de aprimoramento
    let typeDialog = new Dialog({
      title: "Tipo de Aprimoramento",
      content: `
          <p>Selecione o tipo de aprimoramento:</p>
          <div class="form-group">
              <label>Tipo:</label>
              <select id="improvementType" name="improvementType">
                  <option value="twoPoints">+2 pontos em dois atributos e mais +1 ponto em um atributo</option>
                  <option value="threePoints">+1 ponto em três atributos diferentes</option>
              </select>
          </div>
        `,
      buttons: {
        confirm: {
          label: "Próximo",
          callback: async (html) => {
            let improvementType = html.find("#improvementType")[0].value;
            typeDialog.close();
            await showAttributeDialog(improvementType);
          },
        },
        cancel: {
          label: "Cancelar",
        },
      },
    });

    typeDialog.render(true);
  }

  async function showAttributeDialog(improvementType) {
    // Abre um diálogo para selecionar os atributos a serem aumentados
    let dialogContent;
    if (improvementType === "twoPoints") {
      dialogContent = `
        <p>Selecione o atributo para aumentar em 2 pontos:</p>
        <div class="form-group">
            <label>Atributo:</label>
            <select id="increase2" name="increase2">
                <option value="str">Força</option>
                <option value="dex">Destreza</option>
                <option value="con">Constituição</option>
                <option value="int">Inteligência</option>
                <option value="wis">Sabedoria</option>                
                <option value="cha">Carisma</option>
            </select>
        </div>
        <p>Selecione o atributo para aumentar em 1 ponto:</p>
        <div class="form-group">
            <label>Atributo:</label>
            <select id="increase1" name="increase1">
            <option value="str">Força</option>
            <option value="dex">Destreza</option>
            <option value="con">Constituição</option>
            <option value="int">Inteligência</option>
            <option value="wis">Sabedoria</option>                
            <option value="cha">Carisma</option>
            </select>
        </div>
      `;
    } else if (improvementType === "threePoints") {
      dialogContent = `
        <p>Selecione os três atributos para aumentar em 1 ponto cada:</p>
        <div class="form-group">
            <label>Primeiro Atributo:</label>
            <select id="increase1" name="increase1">
                <option value="str">Força</option>
                <option value="dex">Destreza</option>
                <option value="con">Constituição</option>
                <option value="int">Inteligência</option>
                <option value="wis">Sabedoria</option>                
                <option value="cha">Carisma</option>
            </select>
        </div>
        <div class="form-group">
            <label>Segundo Atributo:</label>
            <select id="increase2" name="increase2">
                <option value="str">Força</option>
                <option value="dex">Destreza</option>
                <option value="con">Constituição</option>
                <option value="int">Inteligência</option>
                <option value="wis">Sabedoria</option>                
                <option value="cha">Carisma</option>
            </select>
        </div>
        <div class="form-group">
            <label>Terceiro Atributo:</label>
            <select id="increase3" name="increase3">
                <option value="str">Força</option>
                <option value="dex">Destreza</option>
                <option value="con">Constituição</option>
                <option value="int">Inteligência</option>
                <option value="wis">Sabedoria</option>                
                <option value="cha">Carisma</option>
            </select>
        </div>
      `;
    }

    new Dialog({
      title: "Aprimoramento de Pontos de Atributo",
      content: dialogContent,
      buttons: {
        confirm: {
          label: "Aprimorar atributos",
          callback: async (html) => {
            if (improvementType === "twoPoints") {
              const increase2Value = html.find("#increase2").val();
              const increase1Value = html.find("#increase1").val();

              if (increase2Value === increase1Value) {
                ui.notifications.error(
                  "Selecione dois atributos diferentes para o aprimoramento."
                );
                return;
              }

              asiAttributeIncrease[increase2Value] += 2;
              asiAttributeIncrease[increase1Value] += 1;
            } else if (improvementType === "threePoints") {
              const increase1Value = html.find("#increase1").val();
              const increase2Value = html.find("#increase2").val();
              const increase3Value = html.find("#increase3").val();

              if (
                increase1Value === increase2Value ||
                increase1Value === increase3Value ||
                increase2Value === increase3Value
              ) {
                ui.notifications.error(
                  "Selecione três atributos diferentes para o aprimoramento."
                );
                return;
              }

              asiAttributeIncrease[increase1Value] += 1;
              asiAttributeIncrease[increase2Value] += 1;
              asiAttributeIncrease[increase3Value] += 1;
            }

            let asi = {
              changes: [],
              duration: {
                type: "permanent",
              },
              icon: asiIconPath,
              label: "Ability Score Increase",
              source: "Giff", // Definir a propriedade source com o valor de raceName
            };

            for (const attribute in asiAttributeIncrease) {
              if (asiAttributeIncrease[attribute] > 0) {
                asi.changes.push({
                  key: `data.abilities.${attribute}.value`,
                  mode: 2,
                  priority: 20,
                  value: asiAttributeIncrease[attribute],
                });
              }
            }

            selectedToken.actor.createEmbeddedDocuments("ActiveEffect", [asi]);

            for (const attribute in asiAttributeIncrease) {
              if (asiAttributeIncrease[attribute] > 0) {
                selectedToken.actor.update({
                  [attribute]:
                    selectedToken.actor.data.data[attribute] +
                    asiAttributeIncrease[attribute],
                });
              }
            }

            await createItems();
          },
        },
        cancel: {
          label: "Cancelar",
        },
      },
    }).render(true);
  }

  async function runMacro() {
    // Verifica a existência dos itens e do efeito antes de prosseguir
    const existingItems = selectedToken.actor.items.filter((item) => {
      return itemsToAdd.some((itemToAdd) => {
        return item.name === itemToAdd.name && item.type === itemToAdd.type;
      });
    });

    const raceItemRemove = existingItems.filter(
      (item) => item.name === raceName && item.type === "feat"
    );

    if (existingItems.length > 0) {
      const existingItemsIds = existingItems.map((item) => item.id);
      await selectedToken.actor.deleteEmbeddedDocuments(
        "Item",
        existingItemsIds
      );

      if (raceItemRemove.length > 0) {
        // Item 'raceName' removido, exibe a mensagem no chat
        chatMsg = `${selectedToken.actor.name} não é mais um ${raceName} ):`;
        let chatData = {
          user: game.user._id,
          speaker: ChatMessage.getSpeaker(),
          content: chatMsg,
        };
        ChatMessage.create(chatData, {});
      }
    }

    const existingASIEffect = selectedToken.actor.effects.find(
      (effect) => effect.data.label === "Ability Score Increase"
    );
    if (existingASIEffect) {
      await selectedToken.actor.deleteEmbeddedDocuments("ActiveEffect", [
        existingASIEffect.id,
      ]);
    }

    await applyASIEffect();
  }

  runMacro();
} else {
  ui.notifications.error("Nenhum token selecionado.");
}
