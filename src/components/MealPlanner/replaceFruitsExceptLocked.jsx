function replaceFruitsExceptLocked(arrayOfArrays) {
        const newArray = arrayOfArrays.map((fruitsArray) => {
          const preservedFruitIndex = fruitsArray.findIndex((fruit) => fruit.is_locked);
      
          return fruitsArray.map((fruit, index) => {
            if (index === preservedFruitIndex || fruit.is_locked) {
              // Preserve the fruit with is_locked set to true
              return fruit;
            } else {
              // Replace all other fruits with new data
              return { total: Math.floor(Math.random() * 10) + 1, name: `NewFruit${index}` };
            }
          });
        });
      
        console.log(newArray);
        return newArray;
      }
      
      // Sample array of arrays of fruits
      const arrayOfArrays = [
        [
          { total: 5, name: 'Apple', is_locked: true }, // Preserve this fruit
          { total: 3, name: 'Banana' },
          { total: 2, name: 'Orange' },
        ],
        [
          { total: 4, name: 'Grapes', is_locked: true }, // Preserve this fruit
          { total: 6, name: 'Mango' },
          { total: 1, name: 'Kiwi' },
        ],
        // Add more arrays of fruits here as needed
      ];
      
    //   const result = replaceFruitsExceptLocked(arrayOfArrays);
    //   console.log(result);
      