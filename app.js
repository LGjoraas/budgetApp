/* *** Udemy JavaScript Course Project - Budget Tracking and Calculator *** Written in class by Lindsey Gjoraas ***
*/


//*****BUDGET CONTROLLER*****
var budgetController = (function() {

	//data model for income and expenses
	//constructor for expense
	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1; //use -1 when not defined
	};
	
	Expense.prototype.calcPercentage = function(totalIncome) {
		
		if (totalIncome > 0) {
			this.percentage = Math.round((this.value / totalIncome) * 100);
		} else {
			this.percentage = -1;
		}
	};
	
	Expense.prototype.getPercentage = function() {
		return this.percentage;
	};
	
	//constructor for income 
	var Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};
	
	//calculate the totals and store them
	var calculateTotal = function(type) {
		var sum = 0;
		//loop over the arrays for exp and inc
		data.allItems[type].forEach(function(cur) {
				sum += cur.value; //sum stored in value as add each exp/inc
		});
		data.totals[type] = sum;
	};
		
	//creates a new object when adding each income or expense	
	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1 //set to -1 for undefined
	};
	
	return {
		//add items to the list
		addItem: function(type, des, val) { 
			var newItem, ID;
			
			// want to select last element of array: ID = last ID + 1 (length - 1)
			
			//create new ID
			if (data.allItems[type].length > 0) {
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
			} else {
				ID = 0;
			};
			
			
			//create new item based on 'inc' or 'exp' type
			if (type === 'exp') {
				newItem = new Expense(ID, des, val);
			} else if (type === 'inc') {
				newItem = new Income(ID, des, val);
			};
			
			//push it into our data structure
			data.allItems[type].push(newItem);
			
			//return the new element
			return newItem;
		},
		
		//delete items from the list
		deleteItem: function(type, id) {
			var ids, index;
			
			ids = data.allItems[type].map(function(current) { //map returns an array
				return current.id;
			});
			
			index = ids.indexOf(id);
			
			if (index !== -1) {
				data.allItems[type].splice(index, 1);
			}
			
		},
		
		//calculate the total budget
		calculateBudget: function() {
			//calculate total income and expenses
			calculateTotal('exp');
			calculateTotal('inc');
			
			//calculate the budget (inc - exp)
			data.budget = data.totals.inc - data.totals.exp;
			
			// calculate the percentage of income that we spent
			if (data.totals.inc > 0) {
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			} else {
				data.percentage = -1;
			};
		},
		
		//calculate the percentages listed with expenses
		calculatePercentages: function() {
			//calculate percentages for each expense item
			data.allItems.exp.forEach(function(cur) {
				cur.calcPercentage(data.totals.inc);
			});
		},
		
		//store the percentages
		getPercentages: function() {
			//call on each of our objects and store (map method)
			var allPerc = data.allItems.exp.map(function(cur) {
				return cur.getPercentage();
			});
			return allPerc;
		},
		
		//get the values to retrieve
		getBudget: function() {
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			};
		},
		
		//to test the data since private methods cannot be accessed by the console:
		testing: function() {
			console.log(data);
		}
	};
})();


//****UI CONTROLLER*****
var UIController = (function() {
	//private variables
	var DOMstrings = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		incomeContainer: '.income__list',
		expensesContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expensesLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensesPercLabel: '.item__percentage',
		dateLabel: '.budget__title--month'
	};
	
	//format the numbers shown
	var formatNumber = function(num, type) {
			var numSplit, int, dec, type;
			//formatting 
			num = Math.abs(num);
			// exactly two decimal points on each number
			num = num.toFixed(2); //method of the number prototype 
			
			//comma separating thousands
			//split string into two parts - decimal part and integer part and stores in array
			numSplit = num.split('.');
			
			int = numSplit[0];
				if (int.length > 3) {
					//only take a part of the string - returns the part that we want
					int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
				}			
			dec = numSplit[1];
			
			//adds + or - before the number (ternary operator)		
			//return the full string to the UI
			return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
		};	
	
	//loop through the list
	var nodeListForEach = function(list, callback) {
		for (var i = 0; i < list.length; i++) {
			callback(list[i], i);
		}	
	};
	
	//public methods
	return {
		//get the values from the input fields
		getInput: function() {
			return {
				type: document.querySelector(DOMstrings.inputType).value, //will be inc or exp
				description: document.querySelector(DOMstrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
			};
			
		},
		
		//add item from the input fields
		addListItem: function(obj, type) { 
			var html, newHtml, element;
			
			//create html strings with placeholder text for income and expense list
			if (type === 'inc') {
				element = DOMstrings.incomeContainer;
				
				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'; 
			} else if (type === 'exp') {
				element = DOMstrings.expensesContainer;
				
				html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			};
			// replace the placeholder text with data from obj
			newHtml = html.replace("%id%", obj.id);
			newHtml = newHtml.replace("%description%", obj.description);
			newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));
			
			// insert the html into the DOM - add child items into the income__list and expense__list
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
				
		},
		
		//delete an item in the list
		deleteListItem: function(selectorID) {
			var el = document.getElementById(selectorID);
			//remove child method - need to move up using parentNode in order to delete a child
			el.parentNode.removeChild(el);
		},
		
		//clear the fields after entry
		clearFields: function() {
			var fields, fieldsArr;
			
			fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
		
			fieldsArr = Array.prototype.slice.call(fields);
			
			fieldsArr.forEach(function(current, index, array) { //loops over all elements of the array - first the inputDescription and then the inputValue
				current.value = "";
			});
			//set focus back to the description field
			fieldsArr[0].focus();
		},
		
		//display the budget in the UI
		displayBudget: function(obj) {
			
			obj.budget > 0 ? type = 'inc' : type = 'exp';
			
			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
			document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
			
			
			if (obj.percentage > 0) {
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
			} else {
				document.querySelector(DOMstrings.percentageLabel).textContent = '---';
			}
				
		},
		
		//display the percentages in the UI
		displayPercentages: function(percentages) {
			//select elements that have the item__percentage class
			var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);//returns a node list
			
			nodeListForEach(fields, function(current, index) {
				if (percentages[index] > 0) {
					current.textContent = percentages[index] + '%'; 
				} else {
					current.textContent = '---';
				}				
			});
		},
		
		displayMonth: function() {
			var now, year, month, months;
			
			now = new Date();	//will return date of today
			months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
			month = now.getMonth();
			
			year = now.getFullYear();
			
			document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
			
		},
		
		//change the outline color for expenses upon selecting expense category
		changedType: function() {
		
			var fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue); //returns a node list
			
			nodeListForEach(fields, function(cur) {
				cur.classList.toggle('red-focus');
			});
			
			document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
		},
		
		getDOMstrings: function() {
			 return DOMstrings;
		}
	};
	
})();


//*****GLOBAL APP CONTROLLER*****
//Connects the budget and UI controllers 
var controller = (function(budgetCtrl, UICtrl) {
	
	//private function - event listeners
	var setupEventListeners = function() {
		var DOM = UICtrl.getDOMstrings();
		
		//event handler when add values to income and expenses
		document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
	
		//listen for when the enter key is pressed to add item
		document.addEventListener('keypress', function(event) {
			if (event.keyCode === 13) {
				ctrlAddItem();
			}
		});
		
		//listen for click delete button
		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
		
		//change color when select expense type
		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
		
	};
	
	
	//update budget
	var updateBudget = function() {
		// calculate the budget
		budgetCtrl.calculateBudget();
		
		//return the budget
		var budget = budgetCtrl.getBudget();
		
		// update the UI - display the budget 
		UICtrl.displayBudget(budget);
	};
	
	//update the percentages
	var updatePercentages = function() {
		
		//calculate the percentages
		budgetCtrl.calculatePercentages();
		
		//read percentages them from the budget controller
		var percentages = budgetCtrl.getPercentages();
		
		//update the UI with the new percentages
		UICtrl.displayPercentages(percentages);
	};
	
	
	//Add item to the UI
	var ctrlAddItem = function() {
		var input, newItem;
		// get the field input data
		input = UICtrl.getInput(); //get it from the UI controller
		
		if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
			// add the item to the budget controller - returns an object
			newItem = budgetCtrl.addItem(input.type, input.description, input.value);
		
			// addthe new item to the new UI
			UICtrl.addListItem(newItem, input.type);

			//clear the fields
			UICtrl.clearFields();

			//calculate and update the budget
			updateBudget();
			
			//calculate and update the percentages
			updatePercentages();
		}
	};
	
	//delete item from UI
	var ctrlDeleteItem = function(event) {
		var itemID, splitID, type, ID;
		
		//retrieve the id from the child elements that want to use to delete each item
		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
		
		if (itemID) {
			//all strings has access to split
			//inc-1
			splitID = itemID.split('-'); //returns an array where first elemnt is inc and second element is 1 - it splits at the -
			//get the elements from the arrays created from the split
			type = splitID[0];
			ID = parseInt(splitID[1]);
			
			//delete the item from the data structure
			budgetCtrl.deleteItem(type, ID);
			
			//delete the item from the UI
			UICtrl.deleteListItem(itemID);
			
			//update and show the new budget
			updateBudget();
			
			//calculate and update the percentages
			updatePercentages();
		}
	};
	
	return {
		//function to run on startup of app - initial displays
		init: function() {
			UICtrl.displayMonth();
			UICtrl.displayBudget({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: -1
			});
			setupEventListeners();
		}
	};
})(budgetController, UIController);

controller.init();

































