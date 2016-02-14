/*jshint browser: true, devel: true, jquery: true*/

function MarshalGrid(container, element, formation, gutter, breakpoints){
    this.container = $(container);
    this.troops = $(element);
    this.formation = formation;
    this.gutter = gutter;
    this.breakpoints = breakpoints;
 }

MarshalGrid.prototype.enlist = function() {
    var troopName = this.formation;

    //add class to formation wrapper
    this.container.addClass(troopName + '_wrapper');

    //add class to elements
    if (troopName.charAt(troopName.length-1) === 's') {
        troopName = troopName.substr(0, troopName.length-1);
    }
    for (var i = 0; i < this.troops.length; i++) {
        this.troops[i].className += ' marshal_' + troopName;
    }//end for
};

MarshalGrid.prototype.setBreakpoints = function(width, smlVal, medVal, lrgVal, xLrgVal){

    //determine value of a current breakpoint depending on the given widths
    var breakpoint;
    if (width < this.breakpoints[0]) {
        breakpoint = smlVal;
    } else if (width < this.breakpoints[1]) {
        breakpoint = medVal;
    } else if (width < this.breakpoints[2]) {
        breakpoint = lrgVal;
    } else {
        breakpoint = xLrgVal;
    }
    return breakpoint;
};


MarshalGrid.prototype.perRow = function() {
    //determine number of elements in each row based on wrapper width and breakpoints
    this.elementsPerRow = this.setBreakpoints(this.container.width(), 1, 2, 3, 4);
};

MarshalGrid.prototype.bricks = function(mobile, medium, large) {

    this.rows = {};
    var rows = this.rows;

    rows.row = [];
    var row = this.rows.row;

    this.perRow('bricks', mobile, medium, large);
    var perRow = this.elementsPerRow;

    //determine number of rows and push elements into corresponding row objects
    var self = this;
    (function() {
        var numberRows = Math.ceil(self.troops.length / perRow);
        var rowIndex = 0;
        for (var i = 1; i <= numberRows; i++) {
            var singleRow = self.troops.slice(rowIndex, (rowIndex + perRow));
            self.rows.row.push( { elements: singleRow } );

            rowIndex = rowIndex + self.elementsPerRow;
            }
        })();//end IIFE

        for (var i = 0; i < row.length; i++) {
            var width = 0;
            var currentRow = row[i];

            //determine current width of each row
            var j;
            for(j = 0; j < currentRow.elements.length; j++) {

                var element = currentRow.elements[j];
                var calcWidth = element.offsetWidth / (element.offsetHeight / 100);
                element.calcWidth = calcWidth;

                width = width + calcWidth;
			 	}//end for var j
            currentRow.width = width;

			//determine factor to multiply width by
			var totalGutter = this.gutter * (this.elementsPerRow - 1);
        //totalCardsWidth = this.container.width() - totalGutter;
    //this.dimensions.cardWidth = Math.floor(totalCardsWidth / this.elementsPerRow);

            var containerWidth = this.container.width() - totalGutter;
            var widthFactor = (containerWidth) / currentRow.width;

			//calculate new width and heights and position bricks accordingly
			var newWidth,
                leftPos = 0,
                topPos;
                for(j = 0; j < currentRow.elements.length; j++) {
					//calculate new width of element
                    var brick = currentRow.elements[j];
                        if (this.elementsPerRow === 1) {
                        $(brick).width(containerWidth) ;
					} else {
                        newWidth = brick.calcWidth * widthFactor;
				        if (currentRow.elements.length < perRow) {
                            newWidth = newWidth / perRow * currentRow.elements.length;
                            }
                        $(brick).width(newWidth);
                        }
                    //calculate new height of element based on recalculated width.
                    currentRow.rowHeight = $(brick).height();

                    //absolute position left with jQuery position()
                    $(brick).css('left', leftPos);
                    leftPos += (brick.width + this.gutter);

                    //absolute position top with jQuery position()
                    if (i === 0) {
                        $(brick).css('top', 0);
                        if (j === (currentRow.elements.length - 1)) {
                            topPos = (currentRow.rowHeight + this.gutter);
                        }
                    } else {
                        $(brick).css('top', topPos);
                        if (j === (currentRow.elements.length - 1)) {
                            topPos += (currentRow.rowHeight + this.gutter);
                        }
                    }


                }//end for var j

		}//end for var i

    //Set wrapper height
    var lastBrick = $('.marshal_brick').last(),
        lastBrickPos = lastBrick.position(),
        wrapperHeight = lastBrickPos.top + lastBrick.height();
    $('.bricks_wrapper').css('height', wrapperHeight);

    //Change css visibility from hidden to visible
    $('.bricks_wrapper').css('visibility', 'visible');


};//end bricks


MarshalGrid.prototype.cards = function(){

    this.dimensions = { cardHeights: [], topPositions: [] };
    this.perRow();

    //determine individual card width less gutter (in px)
    var totalGutter = this.gutter * (this.elementsPerRow - 1),
        totalCardsWidth = this.container.width() - totalGutter;
    this.dimensions.cardWidth = Math.floor(totalCardsWidth / this.elementsPerRow);

    //set width of cards & then get resized heights
    //Use to position. Store column heights in array, updating with each row
    var i;
    for (i = 0; i < this.troops.length; i++) {

        var card = $(this.troops[i]);
        card.width(this.dimensions.cardWidth);
        this.dimensions.cardHeights[i] = card.height();

        //postition first row with jQuery position()
        if (i < this.elementsPerRow) {
            var leftPosition = (this.dimensions.cardWidth + this.gutter) * i;
            card.css('top', 0);
            card.css('left', leftPosition);

            var cardPosition = card.position();
            this.dimensions.topPositions[i] = cardPosition.top;
        }
        //position subsequent rows
        //determine the previous card in the column and position the next card accordingly.
        else {
            var prevIndex = i - this.elementsPerRow;
            var prevCard = $(this.troops[prevIndex]);
            var prevCardPosition = prevCard.position();
            var thisCardTop = prevCard.height() + prevCardPosition.top + this.gutter;
            var thisCardLeft = prevCardPosition.left;

            card.css('top', thisCardTop);
            card.css('left', thisCardLeft);

            var cardOffset = card.position();
            this.dimensions.topPositions[i] = cardOffset.top;

            }
        }//end for

        //set height for wrapper to be the height of the longest column
        var columnHeight = 0;
        var cardPos = this.dimensions.topPositions;

        for (i = cardPos.length - 1; i >= cardPos.length - this.elementsPerRow; i--) {
            var pos = cardPos[i] + this.dimensions.cardHeights[i];
            if (pos > columnHeight) {
                columnHeight = pos;
            }
        }
        this.container.height(columnHeight);

        //Change css visibility from hidden to visible
        $('.cards_wrapper').css('visibility', 'visible');

};//end cards

//Function to initialize a new grid
var marshal = function(gridDetails){
    var wrapper = gridDetails.wrapper,
        troops = gridDetails.troops,
        formation = gridDetails.formation || 'cards',
        breakpoints = gridDetails.breakpoints || [350, 650, 950],
        gutter = gridDetails.gutter || 0;

    var grid = new MarshalGrid(wrapper, troops, formation, gutter);
    grid.breakpoints = breakpoints;
    grid.enlist();

    if (formation === 'cards') {
        grid.cards();
    } else {
        grid.bricks();
    }

	//Resize cards on window resize.
	$(window).resize(function() {
        if (formation === 'cards') {
            grid.cards();
        } else {
            grid.bricks();
        }
    });

};//end newGrid
