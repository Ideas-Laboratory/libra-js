
   //Disable right mouse click Script
   //By Maximus (maximus@nsimail.com) w/ mods by DynamicDrive
   //For full source code, visit http://www.dynamicdrive.com

   var message="Function Disabled!";

   ///////////////////////////////////
   function clickIE4(){
   if (event.button==2){

   return false;
   }
   }

   function clickNS4(e){
   if (document.layers||document.getElementById&&!document.all){
   if (e.which==2||e.which==3){
   return false;
   }
   }
   }

   if (document.layers){
   document.captureEvents(Event.MOUSEDOWN);
   document.onmousedown=clickNS4;
   }
   else if (document.all&&!document.getElementById){
   document.onmousedown=clickIE4;
   }

   document.oncontextmenu=new Function("return false")


   /**
 * This file contains functions which can be used across all prototypes,
 * mostly shared across barchart, heatmap and piechart (since they are very similar)
 *
 * All functions must be passed a variable containing a reference to the object (this)
 * in order to access object variables and/or functions
 */
//TODO: move functions related to user study to a separate file
/**Clears the visualization elements appended to the SVG (used when the dataset is changed
 * objectClass: is the class name e.g., ".bars", assigned to all data objects associated with the
 * visualization
 * */
function clearVis (objectClass){
    if (!d3.selectAll(objectClass).empty()){
        d3.selectAll(objectClass).remove();
        d3.selectAll(".axisLabel").remove();
        d3.selectAll(".axis").remove();
        d3.select("#hintPath").remove();
        d3.select("#legend").remove();
    }
}
/**Checks if a mobile device is being used, called when the page loads
 * @return true if mobile, false otherwise
 * This code is from: http://stackoverflow.com/questions/3514784/what-is-the-best-way-to-detect-a-handheld-device-in-jquery
 * */
function checkDevice (){
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        return true;
    }
    return false;
}
/**Changes some display properties of the hint path, such as increasing the stroke width and
 * making the colour lighter.  To make the hint path look nicer in it's non-blurred form
 * */
function drawMobileHintPath (objectRef){
    objectRef.svg.select("#path").style("stroke-opacity",0.5).style("stroke-width",4);
    objectRef.svg.select("#underlayer").style("stroke-width",5);
}
/**Resolves the user's coordinates depending on whether there is touch or mouse interaction
 * */
function getUserCoords (event, objectRef){
    if (d3.touches(objectRef).length > 0){
        return [d3.touches(objectRef)[0][0],d3.touches(objectRef)[0][1]];
    }
    return [event.x,event.y];
}
//////////////////////Updating important object variables//////////////////////

/** Updates the view variables to move the visualization forward
 * (passing the next view), also sets the direction travelling in time
 * draggingDirection: set to 1/-1 (physical dragging direction of user)
 *                    set to 0, if unknown
 * */
function moveForward(objectRef,draggingDirection){

    if (objectRef.nextView < objectRef.lastView){ //Avoid index out of bounds
        objectRef.currentView = objectRef.nextView;
        objectRef.nextView++;
        //objectRef.timeDirection = 1;
    }else if (draggingDirection !=0){
        if (draggingDirection != objectRef.previousDragDirection){ //Flip the direction when at the end of the hint path
            objectRef.timeDirection = (objectRef.timeDirection==1)?-1:1;
        }
    }
}
/**Finds the pixel distance from the user's point to the dragged data object's point
 * @return the pixel distance (calculated with the euclidean distance formula)
 * */
function findPixelDistance (userX,userY,objectX,objectY){
    var term1 = userX - objectX;
    var term2 = userY - objectY;
    return Math.sqrt((term1*term1)+(term2*term2));
}
/** Updates the view tracking variables when the view is being changed by an external
 * visualization (e.g., slider)
 * */
function changeView (objectRef,newView){
    if (newView ==0){
        objectRef.currentView = newView
        objectRef.nextView = newView+1;
    }else if (newView == objectRef.lastView){
        objectRef.nextView = newView;
        objectRef.currentView = newView -1;
    }else {
        objectRef.currentView = newView;
        objectRef.nextView = newView + 1;
    }
}
/**Adjusts the view variables in case they have gone out of bounds
 * @return the view to draw the visualization at */
function adjustView (objectRef){
    if (objectRef.nextView > objectRef.lastView){
        objectRef.nextView--;
        objectRef.currentView--;
        objectRef.interpValue = 0;
        return objectRef.nextView;
    }else if (objectRef.nextView == objectRef.lastView){
        return objectRef.nextView;
    }
    return objectRef.currentView;
}
/** Updates the view variables to move the visualization backward
 * (passing the current view), also sets the direction travelling
 *  over time
 * draggingDirection: set to 1/-1 (physical dragging direction of user)
 *                    set to 0, if unknown
 * */
function moveBackward (objectRef,draggingDirection){
    if (objectRef.currentView > 0){ //Avoid index out of bounds
        objectRef.nextView = objectRef.currentView;
        objectRef.currentView--;
        objectRef.interpValue = 0;
        //objectRef.timeDirection = -1;
    }else if (draggingDirection !=0){
        if (draggingDirection != objectRef.previousDragDirection){ //Flip the direction when at the end of the hint path
            objectRef.timeDirection = (objectRef.timeDirection==1)?-1:1;
        }
    }
}
/** Checks if the mouse is in bounds defined by a and b, updates the interpolation amount
 *  mouse: the mouse position
 *  @return start,end: boundary values are returned if the given
 *                     mouse position is equal to or has crossed it
 *          mouse: The mouse value, if in bounds
 * */
function checkBounds (objectRef,a,b,mouse){
    //Resolve the boundaries for comparison, start is lower value, end is higher
    var start,end;
    if (a>b){
        end = a;
        start =b;
    }else{
        start = a;
        end = b;
    }

    //Check if the mouse is between start and end values
    if (mouse <= start) {
        return start;
    }else if (mouse >= end) {
        return end;
    }
    return mouse;
}
/** Calculates the interpolation amount  (percentage travelled) of the mouse, between views.
 *   Uses the interpolation amount to find the direction travelling over time and saves it
 *   in the global variable (interpValue). Also, updates the direction travelling over time (
 *   if there is a change in dragging direction)
 *
 *   a,b: position of boundary values (mouse is currently in between)
 *   mouse: position of the mouse
 *   draggingDirection: physical dragging direction of the user
 *   ambiguity: a flag, = 1, ambiguous case
 *                      = 0, normal case
 */
function findInterpolation (objectRef,a,b,mouse,ambiguity,draggingDirection){
    var distanceTravelled, currentInterpValue;
    var total = Math.abs(b - a);
    //Calculate the new interpolation amount
    if (ambiguity == 0){
        distanceTravelled = Math.abs(mouse-a);
        currentInterpValue = distanceTravelled/total;
    }else{
        if (objectRef.passedMiddle ==0 ){ //Needs to be re-mapped to lie between [0,0.5] (towards the peak/trough)
            distanceTravelled = Math.abs(mouse - a);
            currentInterpValue = distanceTravelled/(total*2);
        }else{ //Needs to be re-mapped to lie between [0.5,1] (passed the peak/trough)
            distanceTravelled = Math.abs(mouse - b);
            currentInterpValue = (distanceTravelled+total)/(total*2);
        }
    }
    //Set the direction travelling over time (1: forward, -1: backward)
    if (draggingDirection != objectRef.previousDragDirection){
        objectRef.timeDirection = (objectRef.timeDirection==-1) ? 1:-1;
    }
    //objectRef.timeDirection = (currentInterpValue > objectRef.interpValue)? 1 : (currentInterpValue < objectRef.interpValue)?-1 : objectRef.timeDirection;

    //Save the current interpolation value
    objectRef.interpValue = currentInterpValue;
}
/**Infers the time direction when user arrives at areas on the hint path where interaction is ambiguous (e.g., peaks)
 * Inference is based on previous direction travelling over time.  The views are updated (forward or backward)
 * whenever the dragging direction changes.
 * draggingDirection: physical dragging direction of the user
 * atCurrent: the view which user is currently at or passing (=0 if at next view, =1 if at current)
 * */
function inferTimeDirection (objectRef,draggingDirection,atCurrent){

    if (objectRef.previousDragDirection != draggingDirection){
        if (atCurrent==0 && objectRef.timeDirection ==1){
            moveForward(objectRef,draggingDirection);
        }else if (atCurrent ==1 && objectRef.timeDirection ==-1){
            moveBackward(objectRef,draggingDirection);
        }
    }
}

/**Updates variables for dragging along the sine wave:
 *  pathDirection: vertical direction of the approaching portion of the sine wave (e.g., at next view)
 *  value: of the stationary object
 *  passedMiddle: a flag to determine how to calculate the interpolation (0: interp is between 0 and <0.5,
 *  1: interp is between 0.5 and < 1)
 * */
function setSineWaveVariables (objectRef,pathDirection,value,passedMiddle){
    objectRef.passedMiddle = passedMiddle;
    objectRef.pathDirection = pathDirection;
    objectRef.peakValue = (pathDirection==1)?(value-objectRef.amplitude):(objectRef.amplitude+value);
}
//////////////////////Indicators along the hint path//////////////////////

/** Appends a progress indicator to the svg (with id "progress"), if there isn't already one
 *  data: 2d array of points for drawing the entire hint path line
 * */
function appendProgress (objectRef,data){

    if (objectRef.svg.select("#progress").empty()){
        //Add the blur filter to the SVG so other elements can call it
        objectRef.svg.append("svg:defs").append("svg:filter")
            .attr("id", "blurProgress")
            .append("svg:feGaussianBlur")
            .attr("stdDeviation", 3);

        objectRef.svg.select("#hintPath").append("path").datum(data)
            .attr("id","progress").attr("filter", "url(#blurProgress)");
    }
}


/** Re-draws a progress indicator using the stroke dash interpolation example by mike bobstock:
 * http://bl.ocks.org/mbostock/5649592
 * interpAmount: how far travelled between views
 * translateAmount: to animate the progress path with the hint path
 * type: of progress path (small segments or entire path)
 * */
function drawProgress (objectRef,interpAmount,translateAmount,type){
    var myRef = objectRef;

    if (!objectRef.svg.select("#progress").empty()){

        //Create the interpolation function and get the total length of the path
        var length = d3.select("#progress").node().getTotalLength();
        var interpStr = d3.interpolateString("0," + length, length + "," + length);
        //Make some adjustments according to the type of progress path selected
        if (type == 0 && interpAmount==0){ //Small progress paths, at the point of transitioning views
            this.svg.select("#progress").attr("d", function (d) {return myRef.hintPathGenerator([d[myRef.currentView],d[myRef.nextView]])});
        }else if (type==1){ //Large progress path, adjust the interpolation
            interpAmount = (objectRef.currentView-1)/objectRef.lastView + interpAmount/objectRef.lastView;
        }

        //Re-colour the progress path
        this.svg.select("#progress").attr("stroke-dasharray",interpStr(interpAmount))
            .attr("transform","translate(" + (-translateAmount) + ")");
    }
}
/** Sets the type of hint path to be drawn
 *  Type: Full hint path = 0, partial hint path (removed labels) = 1
 * */
function setHintPathType (objectRef,type){
    objectRef.hintPathType = type;
}

//////////////////////Indicators along a sine wave (interaction path)//////////////////////

/** Appends an anchor to the svg (with id 'anchor), if there isn't already one
 *  x,y: starting position of the anchor
 *  type: of anchor 0 - inner elastic, 1 - outer elastic, 2 - circle, 3 - circle and elastic
 * */
function appendAnchor (objectRef,x,y,type){
    var myRef = objectRef;
    if (objectRef.svg.select("#anchor").empty()){
        if (type ==0 || type ==1){ //Inner or outer elastic
            objectRef.svg.select("#hintPath").append("path").datum([[x,y]]).style("stroke","none")
                .attr("d", myRef.hintPathGenerator).attr("id","anchor");
        }else if (type == 2){ //Circle
            objectRef.svg.select("#hintPath").append("circle").attr("cx", x).attr("cy", y).attr("r",4).style("stroke","none").attr("id","anchor");
        }else if (type==3){ //Circle + elastic
            objectRef.svg.select("#hintPath").append("g").attr("id","anchor");
            objectRef.svg.select("#anchor").append("circle").attr("cx", x).attr("cy", y).attr("r",4).style("stroke","none");
            objectRef.svg.select("#anchor").append("path").datum([[x,y]]).style("stroke","none")
                .attr("d", objectRef.hintPathGenerator);
        }
    }
}

/** Re-draws the anchor, depends on the type of anchor (see function above for the scheme)
 * objY = y-value of the data object
 * mouseX, mouseY: mouse coordinates during dragging
 * newY = newY lies along the sine wave somewhere
 * */
function redrawAnchor (objectRef,objY,mouseX,mouseY,newY,type){
    var myRef = objectRef;
    if (type ==0){ //Outer elastic
        objectRef.svg.select("#anchor").attr("d",function (d) {return myRef.hintPathGenerator([[mouseX,mouseY],[d[0][0],newY]]);})
            .style("stroke","#c7c7c7");
    }else if (type == 1){ //Inner Elastic
        objectRef.svg.select("#anchor").attr("d",function (d) {return myRef.hintPathGenerator([[d[0][0],objY],[d[0][0],newY]]);})
            .style("stroke","#c7c7c7");
    }else if (type ==2){ //Circle
        objectRef.svg.select("#anchor").attr("cy",newY).style("stroke","#c7c7c7");
    }else if (type==3){ //Circle and elastic
        objectRef.svg.select("#anchor").select("path").attr("d",function (d) {return myRef.hintPathGenerator([[d[0][0],objY],[d[0][0],newY]]);})
            .style("stroke","#c7c7c7");
        objectRef.svg.select("#anchor").select("circle").attr("cy",newY).style("stroke","#c7c7c7");
    }
}

/**Hides an anchor by removing it's colour
 * */
function hideAnchor (objectRef,type){
    if (type == 0 || type == 1 || type ==2){
        objectRef.svg.select("#anchor").style("stroke","none");
    }else if (type ==3){
        objectRef.svg.select("#anchor").select("circle").style("stroke","none");
        objectRef.svg.select("#anchor").select("path").style("stroke","none");
    }
}
/** Removes an anchor from the svg
 * */
function removeAnchor (objectRef){
    if (!objectRef.svg.select("#anchor").empty()){
        objectRef.svg.select("#anchor").remove();
    }
}
/**Draws a colour scale showing what is assigned to each colour
 * colours: the different colours to map the values to
 * labels: the labels to identify each colour
 * x,y: left and top margins of the scale
 * w,h: of the colour blocks in the legend
 * spacing: between the colour blocks (optional, but must be 1 if none is desired)
 * */
function drawColourLegend (objectRef,colours,labels,x,y,w,h,spacing){

    //Prepare the data for drawing the scale
    objectRef.svg.selectAll(".legend").data(colours.map(function (d,i) {
        var yCoord = i*h*spacing + y ;
        return {colour:d,id:i,label:labels[i],y:yCoord};
    })).enter().append("g").attr("class","legend");

    //Draw the colours as rectangles
    objectRef.svg.selectAll(".legend").append("rect")
        .attr("x", x).attr("y",function(d){return d.y})
        .attr("width",w).attr("height",h)
        .style("fill",function (d){return d.colour});

    //Draw the labels for each colour
    objectRef.svg.selectAll(".legend").append("text").attr("x",x+w+5)
        .attr("y",function(d){return (d.y + h/2*spacing)})
		.style("fill","#666")
        .text(function (d){return d.label})
}
/** Search for ambiguous cases in a list of values along the hint path.  Ambiguous objects are tagged as 1, this is stored in
 *  ambiguousObjs
 *
 *  To alleviate interaction in regions where the heights are very similar (within valueThreshold), we also consider
 *  these objects to be stationary in value.
 * */
function checkAmbiguous(objectRef,values,valueThreshold){
    var j, currentObj;
    var ambiguousObjs = [];
    var length = values.length;
    objectRef.isAmbiguous = 0;

    for (j=0;j<=length;j++){
        ambiguousObjs[j] = [0];
    }

    //Search for values that match
    for (j=0;j<length;j++){
        currentObj = values[j];
        for (var k=0;k<length;k++){
            if (j!=k && Math.abs(values[k] - currentObj)<= valueThreshold){ //A repeated (or almost repeated) value is found
                    if (Math.abs(k-j)==1){ //Stationary value
                        objectRef.isAmbiguous = 1;
                        ambiguousObjs[j] = [1];
                    }

            }
        }
    }
    if (objectRef.isAmbiguous ==1){
        //Generate points for drawing an interaction path
        return findInteractionPaths(ambiguousObjs,values,valueThreshold);
    }
    return [ambiguousObjs,[]];
}
/** Creates an array containing all data for drawing a sine wave:
 * interactionPaths[] = [[points for the sine wave]..number of paths]
 * */
function findInteractionPaths(ambiguousObjs,values,valueThreshold){
    var indices = [];
    var pathNumber = 0;
    var firstPath = false;
    var length = values.length;
    var interactionPaths = [];

    for (var j=0; j< length;j++){
        if (ambiguousObjs[j][0]==1){
            if (j!=0 && (ambiguousObjs[j-1][0]!=1||
                (ambiguousObjs[j-1][0]==1 && Math.abs(values[j]-values[j-1])>valueThreshold))){ //Starting a new path
                if (!firstPath){
                    firstPath = true;
                }else{
                    interactionPaths.push(indices);
                    indices = [];
                    pathNumber++;
                }
            }
            ambiguousObjs[j].push(pathNumber);
            indices.push(j);
        }
    }
    interactionPaths.push(indices);

    return [ambiguousObjs,interactionPaths];
}
/**Highlights data object(s) with the specified id in the highlightColour from the class of data objects
 * Used for completing the tasks in the user evaluation
 * id2 and newColour2 are optional, if N/A then set it as -1
 * */
function highlightDataObject (id1,id2,className,origColour,newColour1,newColour2){
    d3.selectAll(className).style("fill", function (d){
        return (d.id==id1)?newColour1:(d.id==id2)?newColour2:origColour;
    });
}
/**Function which shows info (year labels, middle ticks) on the slider widget */
function showSliderInfo(sliderRef){
    sliderRef.widget.selectAll(".tickLabels").style("fill",sliderRef.displayColour);
}
/**Function which hides info (year labels, middle ticks) on the slider widget.
 * This is used during the user evaluation to remove information about time */
function hideSliderInfo(sliderRef){
   //Hide the tick labels
    sliderRef.widget.selectAll(".tickLabels").style("fill","none");
   //Hide all ticks except the end ones
   /** sliderRef.widget.selectAll(".ticks")
        .style("fill",function(d,i){return ((i==0)||(i==sliderRef.numTicks-1))?sliderRef.displayColour:"none"});*/

}

/** Draws partial hint paths for each visualization
 *  Will be used in the user study
 * */

 //Variables for the hint path line (barchart, heatmap)
 var lineWidth= 12;
 var lineThickness = 2;
 var pathColour = "#EDEDED";
     //969696
 //var tickColour = "#636363";
 //var pathColour = "#969696";
 var tickColour = "#EDEDED";
 var forwardPathLength = 0;
 var backwardPathLength = 0;
 var interpolateStroke = function (length,amount){
     return  d3.interpolateString("0," + length, length + "," + length)(amount);
 }
 ////////////////////////////////////////////////////// For the barchart \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
  /** Displays small hint path by appending its svg components to the main svg
  *  translate: amount the path should be translated by in order to align with the
  *  dragged data object
  *  pathData: an array of points to appear along the entire hint path
  * */
 function drawPartialHintPath_line (objectRef,translate,pathData){
 
       //Partial hint path by drawing individual segments...
       //Draw the hint path line segment at current and next view
     objectRef.svg.select("#hintPath").append("path").datum(pathData)//.attr("clip-path", "url(#clip)")
         .attr("transform","translate("+(-translate)+")").attr("id","path").style("stroke",pathColour)
         .attr("d", function (d) {
             return (typeof(objectRef.hintPathGenerator) === "undefined")?d[objectRef.currentView]:
                 objectRef.hintPathGenerator([d[objectRef.currentView],d[objectRef.nextView]]);
         });
 
      //Draw the next hint path line segment to show dragging direction (shown when travelling forwards)
     objectRef.svg.select("#hintPath").append("path").datum(pathData)
         .attr("transform","translate("+(-translate)+")").attr("id","forwardPath");
 
     //Draw the current hint path line segment to show dragging direction (shown when travelling backwards)
     objectRef.svg.select("#hintPath").append("path").datum(pathData)
         .attr("transform","translate("+(-translate)+")").attr("id","backwardPath").style("stroke","none");
 
     //Draw the markers along the path
     objectRef.svg.select("#hintPath").append("path").datum(pathData).attr("id","backwardMarker")
         .attr("transform","translate("+(-translate)+")").style("stroke","none").style("stroke-width",lineThickness);
     objectRef.svg.select("#hintPath").append("path").datum(pathData).attr("id","forwardMarker")
         .attr("transform","translate("+(-translate)+")").style("stroke","none").style("stroke-width",lineThickness);
     objectRef.svg.select("#hintPath").append("path").datum(pathData).attr("id","currentMarker")
         .attr("transform","translate("+(-translate)+")").style("stroke","none").style("stroke-width",lineThickness);
 
     if (objectRef.nextView != objectRef.lastView){ //Assume when the hint path is first drawn, user is moving forward in time
         objectRef.svg.select("#nextPath").attr("d", function (d) {
             return objectRef.hintPathGenerator([d[objectRef.nextView],d[objectRef.nextView+1]]);
             //(typeof(objectRef.hintPathGenerator) === "undefined")?d[objectRef.nextView]: piechart
         });
     }
 
     //Make the interaction paths (if any) invisible
     if (objectRef.isAmbiguous ==1){
         objectRef.svg.select("#hintPath").selectAll(".interactionPath").style("stroke","none");
     }
 }
 /**Redraws the shortened hint path, where the full path segment is always displayed between next and current view.
  * Depending on the time direction, the next path segment the user is approaching is partially visible.
  * Currently, the entire interaction path is displayed, because setting the stroke-dasharray property won't work
  * */
 //TODO: this code is slightly inefficient, refactor later
 function redrawPartialHintPath_line (objectRef,ambiguousObjects){
 
     //Partial hint path by drawing individual segments...
     //Limit the visibility of the next time interval sub-path
     if (objectRef.timeDirection == 1){ //Moving forward
 
         if (ambiguousObjects.length > 0){
             if (ambiguousObjects[objectRef.nextView][0]==1){
                 objectRef.svg.select("#interactionPath"+ambiguousObjects[objectRef.nextView][1]).style("stroke",pathColour);
                 return;
             }else{
                 objectRef.svg.selectAll(".interactionPath").style("stroke","none");
             }
         }
         //Clear the backward path
         objectRef.svg.select("#backwardPath").style("stroke","none");
         objectRef.svg.select("#backwardMarker").style("stroke","none");
 
         //Create the interpolation function and get the total length of the path
         forwardPathLength = d3.select("#forwardPath").node().getTotalLength();
 
         //Full sub-path of current time interval is always visible
         objectRef.svg.select("#path").attr("d", function (d) {
             return objectRef.hintPathGenerator([d[objectRef.currentView],d[objectRef.nextView]]);
         });
         objectRef.svg.select("#currentMarker").attr("d", function (d) {
             return objectRef.hintPathGenerator([[d[objectRef.nextView][0]-lineWidth,d[objectRef.nextView][1]],
                 [d[objectRef.nextView][0]+lineWidth,d[objectRef.nextView][1]]]);
         }).style("stroke",tickColour).style("stroke-width",lineThickness);
 
         if (objectRef.nextView < objectRef.lastView){
             objectRef.svg.select("#forwardPath").attr("stroke-dasharray",interpolateStroke(forwardPathLength,objectRef.interpValue)).style("stroke",pathColour)
                 .attr("d", function (d) {
                     return objectRef.hintPathGenerator([d[objectRef.nextView],d[objectRef.nextView+1]]);
                 }).attr("filter", "url(#blur2)");
             if (objectRef.interpValue > 0.95){
                 objectRef.svg.select("#forwardMarker").style("stroke",tickColour).style("stroke-width",lineThickness)
                     .attr("d", function (d) {
                         return objectRef.hintPathGenerator([[d[objectRef.nextView+1][0]-lineWidth,d[objectRef.nextView+1][1]],
                             [d[objectRef.nextView+1][0]+lineWidth,d[objectRef.nextView+1][1]]]);
                     });
             }
         }
 
     }else{ //Moving backward
         if (ambiguousObjects.length > 0){
             if (ambiguousObjects[objectRef.currentView][0]==1){
                 objectRef.svg.select("#interactionPath"+ambiguousObjects[objectRef.currentView][1]).style("stroke",pathColour);
                 return;
             }else{
                 objectRef.svg.selectAll(".interactionPath").style("stroke","none");
             }
         }
         //Clear the forward path
         objectRef.svg.select("#forwardPath").style("stroke","none");
         objectRef.svg.select("#forwardMarker").style("stroke","none");
 
         //Create the interpolation function and get the total length of the path
        backwardPathLength = d3.select("#backwardPath").node().getTotalLength();
 
         //Full sub-path of current time interval is always visible
         objectRef.svg.select("#path").attr("d", function (d) {
             return (typeof(objectRef.hintPathGenerator) === "undefined")?d[objectRef.currentView]:
                 objectRef.hintPathGenerator([d[objectRef.currentView],d[objectRef.nextView]]);
         }).attr("filter", "url(#blur2)");
 
         objectRef.svg.select("#currentMarker").attr("d", function (d) {
             return objectRef.hintPathGenerator([[d[objectRef.currentView][0]-lineWidth,d[objectRef.currentView][1]],
                 [d[objectRef.currentView][0]+lineWidth,d[objectRef.currentView][1]]]);
         }).style("stroke",tickColour).style("stroke-width",lineThickness);
 
         if (objectRef.currentView > 0){
             objectRef.svg.select("#backwardPath").attr("stroke-dasharray",interpolateStroke(backwardPathLength,(1-objectRef.interpValue)))
                 .style("stroke",pathColour).attr("d", function (d) {
                     return (typeof(objectRef.hintPathGenerator) === "undefined")?d[objectRef.currentView]:
                         objectRef.hintPathGenerator([d[objectRef.currentView],d[objectRef.currentView-1]]);
                 }).attr("filter", "url(#blur2)");
             if (objectRef.interpValue < 0.05){
                 objectRef.svg.select("#backwardMarker").style("stroke",tickColour).style("stroke-width",lineThickness)
                     .attr("d", function (d) {
                         return objectRef.hintPathGenerator([[d[objectRef.currentView-1][0]-lineWidth,d[objectRef.currentView-1][1]],
                             [d[objectRef.currentView-1][0]+lineWidth,d[objectRef.currentView-1][1]]]);
                     });
             }
         }
 
     }
 }
 /**Hides the small hint path whenever the user stops dragging */
 function hidePartialHintPath (objectRef){
     objectRef.svg.select("#hintPath").selectAll("path").style("stroke","none");
 }
 
 /////////////////////////////////////////////////////// For the scatterplot \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
 var radius = 10;
 var radiusThickness = 1;
 var circleColour = "#BDBDBD";
 
 /** Displays small hint path by appending its svg components to the main svg
  *  translate: amount the path should be translated by in order to align with the
  *  dragged data object
  *  pathData: an array of points to appear along the entire hint path
  * */
 function drawPartialHintPath_line (objectRef,translate,pathData){
 
     //Partial hint path by drawing individual segments...
     //Draw the hint path line segment at current and next view
     objectRef.svg.select("#hintPath").append("path").datum(pathData)//.attr("clip-path", "url(#clip)")
         .attr("transform","translate("+(-translate)+")").attr("id","path").style("stroke",pathColour)
         .attr("d", function (d) {
             return (typeof(objectRef.hintPathGenerator) === "undefined")?d[objectRef.currentView]:
                 objectRef.hintPathGenerator([d[objectRef.currentView],d[objectRef.nextView]]);
         });
 
     //Draw the next hint path line segment to show dragging direction (shown when travelling forwards)
     objectRef.svg.select("#hintPath").append("path").datum(pathData)
         .attr("transform","translate("+(-translate)+")").attr("id","forwardPath");
 
     //Draw the current hint path line segment to show dragging direction (shown when travelling backwards)
     objectRef.svg.select("#hintPath").append("path").datum(pathData)
         .attr("transform","translate("+(-translate)+")").attr("id","backwardPath").style("stroke","none");
 
     //Draw the markers along the path
     objectRef.svg.select("#hintPath").append("circle").datum(pathData).attr("id","backwardMarker")
         .style("stroke","none").style("fill","none").style("stroke-width",radiusThickness)
         .attr("cx",0).attr("cy",0).attr("r",radius);
     objectRef.svg.select("#hintPath").append("circle").datum(pathData).attr("id","forwardMarker")
         .style("stroke","none").style("fill","none").attr("cx",0).attr("cy",0).attr("r",radius).style("stroke-width",radiusThickness);
     objectRef.svg.select("#hintPath").append("circle").datum(pathData).attr("id","currentMarker")
        .style("stroke","none").style("fill","none").style("stroke-width",radiusThickness).attr("cx",0).attr("cy",0).attr("r",radius);
 
     if (objectRef.nextView != objectRef.lastView){ //Assume when the hint path is first drawn, user is moving forward in time
         objectRef.svg.select("#nextPath").attr("d", function (d) {
             return objectRef.hintPathGenerator([d[objectRef.nextView],d[objectRef.nextView+1]]);
             //(typeof(objectRef.hintPathGenerator) === "undefined")?d[objectRef.nextView]: piechart
         });
     }
 
     //Make the interaction paths (if any) invisible
     if (objectRef.isAmbiguous ==1){
         objectRef.svg.select("#hintPath").selectAll(".interactionPath").style("stroke","none");
     }
 }
 /**Redraws the shortened hint path, where the full path segment is always displayed between next and current view.
  * Depending on the time direction, the next path segment the user is approaching is partially visible.
  * Currently, the entire interaction path is displayed, because setting the stroke-dasharray property won't work
  * */
 function redrawPartialHintPath_line (objectRef,ambiguousObjects){
 
     //Partial hint path by drawing individual segments...
     //Limit the visibility of the next time interval sub-path
     if (objectRef.timeDirection == 1){ //Moving forward
 
         if (ambiguousObjects.length > 0){
             if (ambiguousObjects[objectRef.nextView][0]==1){
                 objectRef.svg.select("#interactionPath"+ambiguousObjects[objectRef.nextView][1]).style("stroke",pathColour);
                 return;
             }else{
                 objectRef.svg.selectAll(".interactionPath").style("stroke","none");
             }
         }
         //Clear the backward path
         objectRef.svg.select("#backwardPath").style("stroke","none");
         objectRef.svg.select("#backwardMarker").style("stroke","none");
 
         //Create the interpolation function and get the total length of the path
         forwardPathLength = d3.select("#forwardPath").node().getTotalLength();
 
         //Full sub-path of current time interval is always visible
         objectRef.svg.select("#path").attr("d", function (d) {
             return objectRef.hintPathGenerator([d[objectRef.currentView],d[objectRef.nextView]]);
         });
 
         objectRef.svg.select("#currentMarker").attr("cx", function (d) {return d[objectRef.nextView][0];})
             .attr("cy", function (d) {return d[objectRef.nextView][1];}).style("stroke",circleColour);
 
         if (objectRef.nextView < objectRef.lastView){
             objectRef.svg.select("#forwardPath").attr("stroke-dasharray",interpolateStroke(forwardPathLength,objectRef.interpValue)).style("stroke",pathColour)
                 .attr("d", function (d) {
                     return objectRef.hintPathGenerator([d[objectRef.nextView],d[objectRef.nextView+1]]);
                 }).attr("filter", "url(#blur2)");
             if (objectRef.interpValue > 0.95){
                 objectRef.svg.select("#forwardMarker").attr("cx", function (d) {return d[objectRef.nextView+1][0];})
                     .attr("cy", function (d) {return d[objectRef.nextView+1][1];}).style("stroke",circleColour);
             }
         }
 
     }else{ //Moving backward
         if (ambiguousObjects.length > 0){
             if (ambiguousObjects[objectRef.currentView][0]==1){
                 objectRef.svg.select("#interactionPath"+ambiguousObjects[objectRef.currentView][1]).style("stroke",pathColour);
                 return;
             }else{
                 objectRef.svg.selectAll(".interactionPath").style("stroke","none");
             }
         }
         //Clear the forward path
         objectRef.svg.select("#forwardPath").style("stroke","none");
         objectRef.svg.select("#forwardMarker").style("stroke","none");
 
         //Create the interpolation function and get the total length of the path
         backwardPathLength = d3.select("#backwardPath").node().getTotalLength();
 
         //Full sub-path of current time interval is always visible
         objectRef.svg.select("#path").attr("d", function (d) {
             return (typeof(objectRef.hintPathGenerator) === "undefined")?d[objectRef.currentView]:
                 objectRef.hintPathGenerator([d[objectRef.currentView],d[objectRef.nextView]]);
         }).attr("filter", "url(#blur2)");
 
         objectRef.svg.select("#currentMarker").attr("cx", function (d) {return d[objectRef.currentView][0];})
             .attr("cy", function (d) {return d[objectRef.currentView][1];}).style("stroke",circleColour);
 
         if (objectRef.currentView > 0){
             objectRef.svg.select("#backwardPath").attr("stroke-dasharray",interpolateStroke(backwardPathLength,(1-objectRef.interpValue)))
                 .style("stroke",pathColour).attr("d", function (d) {
                     return (typeof(objectRef.hintPathGenerator) === "undefined")?d[objectRef.currentView]:
                         objectRef.hintPathGenerator([d[objectRef.currentView],d[objectRef.currentView-1]]);
                 }).attr("filter", "url(#blur2)");
             if (objectRef.interpValue < 0.05){
                 objectRef.svg.select("#backwardMarker").attr("cx", function (d) {return d[objectRef.currentView-1][0];})
                     .attr("cy", function (d) {return d[objectRef.currentView-1][1];}).style("stroke",circleColour);
             }
         }
 
     }
 }

 /** Constructor for a scatterplot visualization
 * w: width of the graph
 * h: height of the graph
 * p: a padding value, to format the axes
*/
function Scatterplot(w, h,p) {
    // Position and size attributes for drawing the svg
    this.padding = p;
    this.width = w;
    this.height = h;
    this.pointRadius = 8;
    this.loopRadius = 40;
    this.xLabel ="";
    this.yLabel = "";
    this.graphTitle = "";
    this.hintPathType = 0;   
    
    this.loopCurrent = 0;
    this.loopNext = 1;
 
    // Create a variable to reference the main svg
    this.svg = null;
    this.numPoints = -1; //Set this later
 
    //Variables to track dragged point location within the hint path, all assigned values when the dataset is provided (in render())
    this.currentView = 0;
    this.nextView = 1;
    this.lastView = -1;  //The index of the last view of the dataset
    this.mouseX = -1; //Keep track of mouse coordinates for the dragend event
    this.mouseY = -1;
    this.interpValue = 0; //Stores the current interpolation value (percentage travelled) when a point is dragged between two views
    this.labels = []; //Stores the labels of the hint path
    this.ambiguousPoints = [];  //Keeps track of any points which are ambiguous when the hint path is rendered, by assigning the point a flag
    this.loops = []; //Stores points to draw for interaction loops (if any)
    this.timeDirection = 1; //Tracks the direction travelling over time
 
    //Save some angle values
    this.halfPi = Math.PI/2;
    this.threePi_two = Math.PI*3/2;
    this.twoPi = Math.PI*2;
    this.pi = Math.PI;
 
    //Variables to track interaction events
    this.draggedPoint = -1;
    this.isAmbiguous = 0;  //Whether or not the point being dragged has at least one ambiguous case, set to 0 if none, and 1 otherwise
 
    //Event functions, declared later in this file or in the init file (if visualization is
    // interacting with another visualization) after the object has been instantiated
    this.placeholder = function() {};
    this.clickHintLabelFunction = this.placeholder;
    this.hintPathGenerator =  d3.line().curve(d3.curveLinear);
 
    this.clickedPoints = []; //Keeps track of which points to show labels for
       
    this.pointColour = "00A2E8";
    this.hintPathColour = "#aec7e8";
 
    this.hintPathPoints_flashlight = []; //For the flashlight hint path only, for keeping track of points currently visible on the hint path
 }
  /** Append a blank svg and g container to the div tag indicated by "id", this is where the visualization
  *  will be drawn. Also, add a blur filter for the hint path effect.
  * */
 Scatterplot.prototype.init = function() {
 
     this.svg = d3.select("#mainSvg")
         .append("g").attr("id","gScatterplot")
         .attr("transform", "translate(" + this.padding + "," + this.padding + ")");
 
     //Add the blur filter used for the hint path to the SVG so other elements can call it
     this.svg.append("svg:defs").append("svg:filter")
         .attr("id", "blur").append("svg:feGaussianBlur")
         .attr("stdDeviation", 2);
 
     //Add the blur filter for interaction loops
     this.svg.append("svg:defs").append("svg:filter")
         .attr("id", "blurLoop").append("svg:feGaussianBlur")
         .attr("stdDeviation", 1);
 
     //Add the blur filter for the partial hint path
     this.svg.append("svg:defs").append("svg:filter")
         .attr("id", "blur2").append("svg:feGaussianBlur")
         .attr("stdDeviation", 2);
 
     //Add the blur filter for the flashlight hint path
     this.svg.append("svg:defs").append("svg:filter")
         .attr("id", "blurFlashlight").append("svg:feGaussianBlur")
         .attr("stdDeviation", 2);
 }
 /** Render the visualization onto the svg
  * data: The dataset to be visualized
  * labels: A list of labels for the hint path, indicating all the different views of the visualization
  *
  * Data MUST be provided in the following array format:
  * n is the number of views (or number of labels on the hint path)
  * Object{"points":{[x,y],[x,y]...n},
  *        "label":"name of data point" (optional)
  *       }
  *       ..... number of data points
  * */
 Scatterplot.prototype.render = function( data, labels,xLabel,yLabel,title) {
    var ref = this; //Reference variable
     //Save the parameters in global variables
    this.labels = labels;
    this.lastView = labels.length -1;
    this.numPoints = data.length;
    this.xLabel = xLabel;
    this.yLabel = yLabel;
    this.graphTitle = title;
 
      //Find the max and min values of the points, used to scale the axes and the dataset
      var max_x = d3.max(data.map(function (d){return d3.max(d.points.map(function (a){return a[0];}) ); }));
      var max_y = d3.max(data.map(function (d){return d3.max(d.points.map(function (a){return a[1];}) ); }));
     var min_y = d3.min(data.map(function (d){return d3.min(d.points.map(function (a){return a[1];}) ); }));
 
     //Create the scales by mapping the x,y to the svg size
     var xScale = d3.scaleLinear().domain([0,max_x]).range([0,ref.width]);
     var yScale =  d3.scaleLinear().domain([min_y, max_y]).range([ref.height,0]);
     //var yScale =  d3.scale.linear().domain([min_y, 50000000,max_y]).range([ref.height,ref.height/2,0]); //polylinear scale for the internet user dataset
 
     //Call the function which draws the axes
     this.drawAxes(xScale,yScale);
 
   // Set up the data for drawing the points according to the values in the data set
   this.svg.selectAll("circle")
      .data(data.map(function (d,i) {
               //Re-scale the points such that they are drawn within the svg container
               var scaledPoints = [];
               var interpolatedYears = [];
               for (var j=0;j< d.points.length;j++){
                   //Check for missing data, interpolate based on surrounding points
                   if (d.points[j][0]=="missing" || d.points[j][1]=="missing"){
                       var newPoint = ref.interpolateMissingPoint(d.points,j);
                       interpolatedYears.push(1);
                       scaledPoints[j] = [xScale(newPoint.x)+ref.padding,yScale(newPoint.y)];
                   }else{
                       interpolatedYears.push(0);
                       scaledPoints[j] = [xScale(d.points[j][0])+ref.padding,yScale(d.points[j][1])];
                   }
               }
             return {nodes:scaledPoints,id:i,label:d.label,interpYears:interpolatedYears};
       }))	
       .enter().append("g")
       .attr("class","gDisplayPoints").attr("id",function (d){return "gDisplayPoints"+ d.id});
      
      //Draw the data points
      this.svg.selectAll(".gDisplayPoints").append("svg:circle")
           .attr("cx", function(d) {return d.nodes[ref.currentView][0];})
           .attr("cy", function(d) {return d.nodes[ref.currentView][1]; })
           .attr("r", this.pointRadius).attr("class", "displayPoints")
           .attr("id", function (d){return "displayPoints"+d.id;})
          /** .attr("title", function (d) {return d.label;})*/
          .style("fill-opacity",1).style("stroke","#FFF").style("stroke-width",1)		
         .style("fill",this.pointColour).style("fill-opacity",1);
 
     //Append an empty g element to contain the hint path
     this.svg.append("g").attr("id","hintPath");
 }
 /**Interpolates the value for a year with missing data by using surrounding points
  * points: the array of all points over time
  * year: the year index of the missing data
  * */
 Scatterplot.prototype.interpolateMissingPoint = function (points,year){
     var interpolator;
     if (year>0 && year < points.length-1){ //Not the first or last year
        interpolator = d3.interpolate({x:points[year-1][0],y:points[year-1][1]},
             {x:points[year+1][0],y:points[year+1][1]});
     }else{
         interpolator = d3.interpolate({x:0,y:0},  //TODO:deal with end points, this is just a placeholder
             {x:1,y:1});
     }
     return interpolator(0.5);
 }
 /** Draws the axes  and the graph title on the SVG
  *  xScale: a function defining the scale of the x-axis
  *  yScale: a function defining the scale of the y-axis
  * */
  Scatterplot.prototype.drawAxes = function (xScale,yScale){
 
     //Define functions to create the axes
     var xAxis = d3.axisBottom(xScale)
         .tickSize(-this.height,0,0);
     var yAxis = d3.axisLeft(yScale)
         .tickSize(-this.width,0,0);
 
     // Add the title of the graph
      this.svg.append("text").attr("id", "graphTitle")
          .attr("class","axis").text(this.graphTitle)
          .attr("x",1).attr("y",-15);
 
     // Add the x-axis
     this.svg.append("g").attr("class", "axis")
         .attr("transform", "translate("+this.padding+"," + this.height + ")")
         .call(xAxis).selectAll("line").style("fill","none").style("stroke","#BDBDBD");
 
     // Add the y-axis
     this.svg.append("g").attr("class", "axis")
         .attr("transform", "translate("+ this.padding+ ",0)")
         .call(yAxis).selectAll("line").style("fill","none").style("stroke","#BDBDBD");
 
     // Add an x-axis label
     this.svg.append("text").attr("class", "axisLabel")
         .attr("x", this.width)
         .attr("y", this.height+this.padding-10)
         .text(this.xLabel);
 
     // Add a y-axis label
     this.svg.append("text").attr("class", "axisLabel")
         .attr("x", -15).attr("transform", "rotate(-90)")
         .text(this.yLabel);
 }
 /** Appends an anchor to the svg, if there isn't already one
  * */
 Scatterplot.prototype.appendAnchor = function (){
     if (this.svg.select("#anchor").empty()){
         this.svg.select("#hintPath").append("circle")
          .attr("id","anchor").attr("r",this.pointRadius).style("stroke","none")
          .style("fill","none");
     }
 }
 /** Re-draws the anchor, based on the dragging along the loop
  * interp: amount along the loop to draw the anchor at
  * groupNumber: to select the id of the loop
  * */
 Scatterplot.prototype.redrawAnchor = function (interp,groupNumber){
     var loopPath = d3.select("#loop"+groupNumber).node();
     var totalLength = loopPath.getTotalLength();
     var newPoint = loopPath.getPointAtLength(totalLength*interp);
     this.svg.select("#anchor").attr("cx",newPoint.x).attr("cy",newPoint.y).style("stroke","#c7c7c7");
 }
 /**Hides the circle anchor by removing it's stroke colour
  * */
 Scatterplot.prototype.hideAnchor = function (){
     this.svg.select("#anchor").style("stroke","none");
 }
 /** Removes an anchor from the svg, if one is appended
  * */
 Scatterplot.prototype.removeAnchor = function (){
     if (!this.svg.select("#anchor").empty()){
         this.svg.select("#anchor").remove();
     }
 }
 /** Re-draws the dragged point by projecting it onto the the line segment according to
  *  the minimum distance.  As the point is dragged, the views are updated and the rest
  *  of the points are animated
  *  id: The id of the dragged point, for selecting by id
  *  mousex,y: the mouse coordinates
  *  nodes: the points along the hint path
  * */
 Scatterplot.prototype.updateDraggedPoint = function(id, mouseX, mouseY, nodes) {
    if (this.hintPathType == 1) {
        this.updateDraggedPoint_flashlight(id, mouseX, mouseY, nodes);
        return;
    }

    var closestPoint = this.findClosestPointOnPath(mouseX, mouseY, nodes);
    var newPoint = [closestPoint.x, closestPoint.y];
    var view = closestPoint.view;
    var interpAmount = closestPoint.interpAmount;

    var draggedPoint = this.svg.select("#displayPoints" + id);
    draggedPoint.attr("cx", newPoint[0]).attr("cy", newPoint[1]);
    this.animatePointLabel(id, newPoint[0], newPoint[1]);

    // Update view variables
    if (view < this.currentView) {
        this.nextView = this.currentView;
        this.currentView = view;
        this.interpValue = 1 - interpAmount;
    } else if (view >= this.nextView) {
        this.currentView = this.nextView;
        this.nextView = view + 1;
        this.interpValue = interpAmount;
    } else {
        this.currentView = view;
        this.nextView = view + 1;
        this.interpValue = interpAmount;
    }

    // Interpolate other points
    this.interpolatePoints(id, this.interpValue, this.currentView, this.nextView);

    // Save the mouse coordinates
    this.mouseX = mouseX;
    this.mouseY = mouseY;
}
Scatterplot.prototype.findClosestPointOnPath = function(mouseX, mouseY, nodes) {
    var closestDistance = Infinity;
    var closestPoint = null;
    var closestView = -1;
    var interpAmount = 0;

    for (var i = 0; i < nodes.length - 1; i++) {
        var pt1 = nodes[i];
        var pt2 = nodes[i + 1];
        var closestPointOnSegment = this.findClosestPointOnSegment(mouseX, mouseY, pt1[0], pt1[1], pt2[0], pt2[1]);

        var distance = this.calculateDistance(mouseX, mouseY, closestPointOnSegment.x, closestPointOnSegment.y);
        if (distance < closestDistance) {
            closestDistance = distance;
            closestPoint = closestPointOnSegment;
            closestView = i;
            interpAmount = closestPointOnSegment.t;
        }
    }

    return {
        x: closestPoint.x,
        y: closestPoint.y,
        view: closestView,
        interpAmount: interpAmount
    };
}
Scatterplot.prototype.findClosestPointOnSegment = function(x, y, x1, y1, x2, y2) {
    var dx = x2 - x1;
    var dy = y2 - y1;
    var t = ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy);
    t = Math.max(0, Math.min(1, t));
    return {
        x: x1 + t * dx,
        y: y1 + t * dy,
        t: t
    };
}
 /** Re-draws the dragged point according to the mouse position, changing the hint path
  * display according to the flashlight design
  *  id: The id of the dragged point, for selecting by id
  *  mousex,y: the mouse coordinates
  *  nodes: the points along the hint path
  * */
 Scatterplot.prototype.updateDraggedPoint_flashlight = function(id,mouseX,mouseY,nodes){
   //TODO: ambiguity?
     if (this.hintPathType==3){ //Check if near the time line hint path, if using combined hint path mode
 
     }
 
     this.drawHintPath_flashlight([mouseX,mouseY],nodes);
     //Re-draw the dragged point
     this.svg.select("#displayPoints"+id).attr("cx",mouseX).attr("cy",mouseY);
     this.animatePointLabel(id,mouseX,mouseY);
 
     //Save the mouse coordinates
     this.mouseX = mouseX;
     this.mouseY = mouseY;
 }
 /** Calculates the new position of the dragged point
  * id: of the dragged point
  * pt1, pt2: the boundary points (of current and next view)
  * @return the coordinates of the newPoint as an array [x,y]
  * */
 Scatterplot.prototype.dragAlongPath = function(id,pt1_x,pt1_y,pt2_x,pt2_y){
 
     //Get the two points of the line segment currently dragged along
     var minDist = this.minDistancePoint(this.mouseX,this.mouseY,pt1_x,pt1_y,pt2_x,pt2_y);
     var newPoint = []; //The new point to draw on the line
     var t = minDist[2]; //To test whether or not the dragged point will pass pt1 or pt2
 
     //Update the position of the dragged point
     if (t<0){ //Passed current
         this.moveBackward();
         newPoint = [pt1_x,pt1_y];
     }else if (t>1){ //Passed next
         this.moveForward();
         newPoint= [pt2_x,pt2_y];
     }else{ //Some in between the views (pt1 and pt2)
         this.interpolatePoints(id,t,this.currentView,this.nextView);
         this.interpolateLabelColour(t);
         newPoint= [minDist[0],minDist[1]];
         //Save the values
         this.timeDirection = this.findTimeDirection(t);
         this.interpValue = t; //Save the interpolation amount
         if (this.hintPathType ==2){
           redrawPartialHintPath_line(this,this.ambiguousPoints);
         }
     }
     return newPoint;
 }
 /** Sets the time direction based on the interpolation amount, currently not needed for the interaction
  *  But can be used to log events.
  * @return: the new direction travelling in time
  * */
 Scatterplot.prototype.findTimeDirection = function (interpAmount){
     var direction = (interpAmount > this.interpValue)? 1 : (interpAmount < this.interpValue)?-1 : this.timeDirection;
 
     if (this.timeDirection != direction){ //Switched directions
         console.log("switched directions "+direction+" currentInterp "+this.interpValue+" newInterp "+interpAmount+" "+this.currentView+" "+this.nextView);
     }
     return direction;
 }
 /** Updates the view variables to move the visualization forward
  * (passing the next view)
  * */
 Scatterplot.prototype.moveForward = function (){
     if (this.nextView < this.lastView){ //Avoid index out of bounds
         this.currentView = this.nextView;
         this.nextView++;
         this.timeDirection = 1;
         this.interpValue = 0;
     }
 }
 /** Updates the view variables to move the visualization backward
  * (passing the current view)
  * */
 Scatterplot.prototype.moveBackward = function (){
     if (this.currentView > 0){ //Avoid index out of bounds
         this.nextView = this.currentView;
         this.currentView--;
         this.timeDirection = -1;
         this.interpValue = 1;
     }
 }
 /**Interpolates the label transparency between start and end view, this fading effect is used for
  * distinguishing how close the user is from transitioning views the stationary ambiguous cases.
  * interp: the interpolation amount (amount travelled across start to end)
  * */
 Scatterplot.prototype.interpolateLabelColour = function (interp){
     var ref = this;
     this.svg.selectAll(".hintLabels").attr("fill-opacity",function (d) {
             if (d.id ==ref.currentView){ //Dark to light
                 return d3.interpolate(1,0.5)(interp);
             }else if (d.id == ref.nextView){ //Light to dark
                 return d3.interpolate(0.5,1)(interp);
             }
             return 0.5;
         });
 }
 Scatterplot.prototype.dragAlongLoop = function (id,groupNumber,mouseX,mouseY){
 
     var loopData = this.svg.select("#loop"+groupNumber).data().map(function (d) {return [d.cx, d.cy,d.orientationAngle,d.points2,d.years]});   
     
     //var loopGenerator = d3.svg.line().interpolate("linear"); 
     //this.svg.select("#hintPath").append("path").attr("d",loopGenerator(loopData[0][3])).style("fill","none").style("stroke","#FFF");
 
 
     //d.points[0] = stationary point
     //d.points[1] = to the left of the stationary pt (forward path)
     //d.points[2..] = etc.. keep going counter clockwise
    // this.svg.append("circle").attr("cx",loopData[0][3][3][0]).attr("cy",loopData[0][3][3][1]).attr("r",10).style("fill","red");
     var loopPoints = loopData[0][3];
     var pt1_x = loopPoints[this.loopCurrent][0];
     var pt1_y = loopPoints[this.loopCurrent][1];
     var pt2_x = loopPoints[this.loopNext][0];
     var pt2_y = loopPoints[this.loopNext][1];
 
      var minDist = this.minDistancePoint(mouseX,mouseY,pt1_x,pt1_y,pt2_x,pt2_y);
      var newPoint = []; //The new point to draw on the line
      var t = minDist[2]; //To test whether or not the dragged point will pass pt1 or pt2
 
       var angles = this.calculateMouseAngle(minDist[0],minDist[1],loopData[0][2],loopData[0][0],loopData[0][1]);
       var loopInterp = this.convertMouseToLoop_interp(angles[2]);
     
     //Get the loop's boundary years
     var startYear = loopData[0][4][0];	
     var endYear = loopData[0][4][loopData[0][4].length-1];
     
     if (t<0){ //Passed current on loop
         this.loopNext = this.loopCurrent;
         this.loopCurrent--;
         if (this.loopCurrent < 0){ //Check if the view was passed
            if(this.currentView > startYear){ //In the middle of the loop (2 is the border view)
                 this.moveBackward();
                 this.loopCurrent = 3;
                 this.loopNext = 4;
            }else{ //Move back to the full hint path
                this.loopCurrent = 0;
                this.loopNext = 1;
                this.moveBackward();
            }
         }
         //console.log("backward"+this.loopCurrent+" "+this.loopNext+" views"+this.currentView+" "+this.nextView);
     }else if (t>1){ //Passed next on the loop
        this.loopCurrent = this.loopNext;
        this.loopNext++;
        if (this.loopCurrent > 3){ //Check if the view was passed
             if (this.nextView < endYear){ //Not at the border view
                this.loopCurrent = 0;
                this.loopNext = 1;
                this.moveForward();
             }else{
                 this.loopCurrent = 3;
                 this.loopNext = 4;
                 this.moveForward();
             }
         }
         //console.log("forward"+this.loopCurrent+" "+this.loopNext+" views"+this.currentView+" "+this.nextView);
     }else{ //Some in between the views (pt1 and pt2), redraw the anchor and the view
         //this.svg.select("#anchor").attr("cx",minDist[0]).attr("cy",minDist[1]).style("stroke","#c7c7c7");       
         this.interpAmount = angles[2];
         this.timeDirection = this.findTimeDirection(this.interpAmount,id);
         this.interpolatePoints(id,this.interpAmount,this.currentView,this.nextView);
         this.interpolateLabelColour(this.interpAmount);
         if (this.hintPathType ==2){
             redrawPartialHintPath_line(this,this.ambiguousPoints,this.id);
         }
     }	
     this.redrawAnchor(loopInterp,groupNumber);
 }
 /**Finds the angle of the mouse w.r.t the center of the loop
  * @return [angle,positiveAngle,interpAmount]
  * */
 Scatterplot.prototype.calculateMouseAngle = function (mouseX,mouseY,orientationAngle,loopCx,loopCy){
 
     var newAngle;
     var subtractOne = 0; //For adjusting the interpolation value
 
     if (orientationAngle < this.halfPi && orientationAngle >= 0){ //Between 0 (inclusive) and 90
         newAngle = Math.atan2(mouseY - loopCy, loopCx - mouseX) + orientationAngle; //0/360 deg
     }else if (orientationAngle < this.twoPi && orientationAngle >= this.threePi_two){ //Between 360/0 and 270 (inclusive)
         subtractOne = 1;
         newAngle = Math.atan2(loopCx - mouseX,mouseY - loopCy) - (orientationAngle - this.threePi_two);  //270 deg
     }else if (orientationAngle < this.threePi_two && orientationAngle >= this.pi){ //Between 270 and 180 (inclusive)
         newAngle =  Math.atan2(loopCy - mouseY, mouseX - loopCx) + (orientationAngle- this.pi); //180 deg
     }else{
         subtractOne = 1;
         newAngle = Math.atan2(mouseX - loopCx, loopCy - mouseY) -(orientationAngle - this.halfPi); // 90 deg
     }
 
     var positiveAngle = (newAngle < 0)?((this.pi - newAngle*(-1))+this.pi):newAngle;
 
     var interpAmount = (subtractOne ==1)? (1-positiveAngle/this.twoPi) : (positiveAngle/this.twoPi);
 
     return  [newAngle,positiveAngle,interpAmount];
 }
 /** Adjusts the interpolation value of the mouse angle (1/0 mark is at the stationary point) to draw correctly on
  *  the loop (where 0.5 is at the stationary point)
  * */
 Scatterplot.prototype.convertMouseToLoop_interp = function (mouseInterp){
     return (mouseInterp >=0 && mouseInterp <0.5)?(mouseInterp+0.5):(mouseInterp-0.5);
 }
 /**"Animates" the rest of the points while one is being dragged
  * Uses the 't' parameter, which represents approximately how far along a line segment
  * the dragged point has travelled.  The positions of the rest of the points are interpolated
  * based on this t parameter and re-drawn at this interpolated position
  * id: The id of the dragged point
  * interpAmount: The t parameter, or amount to interpolate by
  * startView,endView: Define the range to interpolate across
  * */
 Scatterplot.prototype.interpolatePoints = function(id,interpAmount,startView,endView){
   var ref = this;
   this.svg.selectAll(".displayPoints").filter(function (d){return d.id!=id;})
       .each(function (d){
           var interpolator = d3.interpolate({x:d.nodes[startView][0],y:d.nodes[startView][1]},
               {x:d.nodes[endView][0],y:d.nodes[endView][1]}); //Function to linearly interpolate between points at current and next view
           var newPoint = interpolator(interpAmount);
           //Update the position of the point according to the interpolated point position
           d3.select(this).attr("cx",newPoint.x).attr("cy",newPoint.y);
 
           //Update the labels (if visible)
           if (ref.clickedPoints.indexOf(d.id)!=-1) ref.animatePointLabel(d.id,newPoint.x,newPoint.y);
       })
 }
 /**Re-draws a point label according to the specified position (new position of the point) by
  * updating its x and y attributes
  * @param id of the point label
  * @param x,y, new position of the label
  * */
 Scatterplot.prototype.animatePointLabel = function (id,x,y){
     var ref = this;
     this.svg.select("#pointLabel"+id).attr("x", x).attr("y", y-ref.pointRadius);
 }
 /** Snaps to the nearest view once a dragged point is released
  *  Nearest view is the closest position (either current or next) to the
  *  most recent position of the dragged point. View tracking variables are
  *  updated according to which view is "snapped" to.
  *  id: The id of the dragged point
  *  points: All points along the hint path
  * */
 Scatterplot.prototype.snapToView = function( id, points) {
     if (this.hintPathType==1){ //Snapping is different for flashlight hint path
         this.snapToView_flashlight(id,points);
         return;
     }
     var distanceCurrent,distanceNext;
     if (this.ambiguousPoints[this.currentView][0] == 1 && this.ambiguousPoints[this.nextView][0] == 1){ //Current and next are stationary points
        distanceCurrent = this.interpValue;
        distanceNext = 0.5;
     }else { //Non-ambiguous point
         //Calculate the distances from the dragged point to both current and next
         distanceCurrent = this.calculateDistance(this.mouseX,this.mouseY, points[this.currentView][0], points[this.currentView][1]);
         distanceNext = this.calculateDistance(this.mouseX,this.mouseY, points[this.nextView][0],points[this.nextView][1]);
     }
 
     //Based on the smaller distance, update the scatter plot to that view
     if (distanceCurrent > distanceNext && this.nextView <= this.lastView){ //Snapping to next view
         this.currentView = this.nextView;
         this.nextView = this.nextView +1;
      }
 
     //Redraw the view
     this.redrawView(this.currentView);
 }
 /** Snaps to the nearest view once a dragged point is released
  *  Nearest view is the closest position
  *  id: The id of the dragged point
  *  points: All points along the hint path
  * */
 Scatterplot.prototype.snapToView_flashlight = function (id,points){
     var minDist = Number.MAX_VALUE;
     var viewToSnapTo = -1;
     var currentPointIndex = -1;
     //TODO: might want to save the current positions visible on the hint path to avoid re-calculating all distances
      for (var i=0;i<this.hintPathPoints_flashlight.length;i++){
          currentPointIndex = this.hintPathPoints_flashlight[i];
          var currentDist = this.calculateDistance(points[currentPointIndex][0],points[currentPointIndex][1],this.mouseX,this.mouseY);
          if (currentDist<minDist) {
              minDist = currentDist;
              viewToSnapTo = currentPointIndex;
          }
      }
     if (viewToSnapTo<this.lastView){
         this.currentView = viewToSnapTo;
         this.nextView = this.currentView+1;
     }
     this.drawHintPath_flashlight(points[viewToSnapTo],points);
     this.redrawView(viewToSnapTo);
 }
 /** Animates all points in the scatterplot along their hint paths from
  *  startView to endView, this function is called when "fast-forwarding"
  *  is invoked (by clicking a year label on the hint path)
  *  id: of the dragged point (if any)
  *  startView, endView: animation goes from start to end view
  *  Resources: http://bl.ocks.org/mbostock/1125997
  *            http://bost.ocks.org/mike/transition/
  * */
  Scatterplot.prototype.animatePoints = function( id, startView, endView) {
 
      if (this.hintPathType==1){ //Go directly to the year, when using flashlight path
          this.redrawView(endView);
          return;
      }
 
      if (startView == endView)return;
      var ref = this;
      //Determine the travel direction (e.g., forward or backward in time)
      var direction = 1;
      if (startView>endView) direction=-1;
 
     //Define some counter variables to keep track of the views passed during the transition
     var totalObjects = this.numPoints;
     var objectCounter = -1;
     var animateView = startView; //Indicates when to switch the views (after all points are finished transitioning)
 
     //Apply multiple transitions to each display point by chaining them
     this.svg.selectAll(".displayPoints").each(animate());
 
     //Recursively invoke this function to chain transitions, a new transition is added once
     //the current one is finished
     function animate() {
         objectCounter++;
         if (objectCounter==totalObjects) {
             animateView = animateView + direction;
             objectCounter = 0;
         }
 
         //Ensure the animateView index is not out of bounds
         if (direction == 1 && animateView>=endView) {return};
         if (direction ==-1 && animateView<=endView) {return};
 
         return function(d) {
             //Re-draw each point at the current view in the animation sequence
             d3.select(this).transition(400).ease("linear")
             .attr("cx",d.nodes[animateView][0])
             .attr("cy",d.nodes[animateView][1])
             .each("end", animate());
             ref.animatePointLabel(d.id, d.nodes[animateView][0], d.nodes[animateView][1]);
             //Re-colour the labels along the hint path (if a path is visible)
             if (d.id == id){
                 d3.selectAll(".hintLabels").attr("fill-opacity",function (b){ return ((b.id==animateView)?1:0.5)});
             }
         };
     }
 }
 /** Redraws the scatterplot's point labels at the specified view
  *  view: the view to draw
  * */
 Scatterplot.prototype.redrawPointLabels = function(view){
     var ref = this;
     this.svg.selectAll(".pointLabels").filter(function (d){return (ref.clickedPoints.indexOf(d.id)!=-1)})
         .attr("x",function (d){return d.nodes[view][0];})
         .attr("y",function (d){return d.nodes[view][1]-ref.pointRadius;});
 }
 /** Redraws the scatterplot at a specified view
  *  view: the view to draw
  *  NOTE: view tracking variables are not updated by this function
  * */
 Scatterplot.prototype.redrawView = function(view) {
     /**if (this.hintPathType==2){ //Partial hint path
         hideSmallHintPath(this);
     }*/
     if (this.hintPathType==0){ //Trajectory
         this.hideAnchor();
         //Re-colour the hint path labels
         this.svg.selectAll(".hintLabels").attr("fill-opacity",function (d){ return ((d.id==view)?1:0.5)});
         this.svg.selectAll(".displayPoints")/**.transition().duration(300)*/
             .attr("cx",function (d){return d.nodes[view][0];})
             .attr("cy",function (d){return d.nodes[view][1];});
 
     }else if (this.hintPathType==1){ //Flashlight
         this.svg.selectAll(".displayPoints").transition().duration(300)
             .attr("cx",function (d){return d.nodes[view][0];})
             .attr("cy",function (d){return d.nodes[view][1];});
     }
     this.redrawPointLabels(view);
 }
 /** Called each time a new point is dragged.  Searches for ambiguous regions, and draws the hint path
  *  */
 Scatterplot.prototype.selectPoint = function (point){
     //In case next view went out of bounds (from snapping to view), re-adjust the view variables
     var drawingView = adjustView(this);
 
     //First check for ambiguous cases in the hint path of the dragged point, then draw loops (if any)
    //  this.checkAmbiguous(point.id, point.nodes);
 
    //  if (this.isAmbiguous==1){
    //      this.appendAnchor();
    //  }
 
     if (this.hintPathType ==0){ //Trajectory path
         this.drawHintPath(drawingView, point.nodes, point.interpYears);
     }else if (this.hintPathType==1){ //Flashlight path
         this.drawHintPath_flashlight(point.nodes[drawingView],point.nodes);
     }else if (this.hintPathType==2){ //Partial hint path used in evaluation
         drawPartialHintPath_line(this,0, point.nodes);
         redrawPartialHintPath_line(this,this.ambiguousPoints);
     }else if (this.hintPathType==3){ //Combined
         this.drawHintPath(drawingView, point.nodes, point.interpYears);
     }
 
     if (this.clickedPoints.indexOf(point.id) ==-1) {
         this.clickedPoints.push(point.id);
         this.drawPointLabel(point.id);
     }
     var ref = this;
     //Fade out the other points using a transition
     this.svg.selectAll(".displayPoints").filter(function (d) {return (ref.clickedPoints.indexOf(d.id)==-1)})
         .transition().duration(300).style("fill-opacity", 0.3);//.style("stroke-opacity",0.3);
 }
 /** Draws a label at the top of the selected point
  * */
 //TODO: draw a line from the corner of the label to the point
  Scatterplot.prototype.drawPointLabel = function (id){
     var ref = this;
     //Add labels to the points
     var gElement = this.svg.select("#gDisplayPoints"+id);
     gElement.append("text")
         .attr("x", function(d) {return d.nodes[ref.currentView][0];})
         .attr("y", function(d) {return d.nodes[ref.currentView][1]-ref.pointRadius; })
         .attr("class","pointLabels").attr("id",function (d){return "pointLabel"+ d.id})
         .text(function (d){return d.label;});
 
     /**var bbox =  this.svg.select("#pointLabel"+id).node().getBBox();
     var padding = 2;
 
     gElement.append("rect").attr("x", bbox.x-padding).attr("y", bbox.y-padding)
         .attr("height",bbox.height+padding*2).attr("width",bbox.width+padding*2)
         .attr("rx",5).attr("ry",5)
         .attr("class","pointLabels").style("fill","#EDEDED").style("fill-opacity",0.3)
         .style("stroke","#EDEDED").style("stroke-opacity",1);*/
 }
 /** Displays a trajectory hint path by appending its svg components to the main svg
  *  view: view to draw at
  *  points: all points along the hint path
  *  interpPts: points that have been interpolated (missing data)
  * */
  Scatterplot.prototype.drawHintPath = function (view,points,interpPts){
      var ref = this;
     //Draw the hint path labels, reposition any which are in a stationary sequence
     var adjustedPoints = this.placeLabels(points);
 
      this.svg.select("#hintPath").selectAll("text")
        .data(adjustedPoints.map(function (d,i) {
             return {x:d[0]+ ref.pointRadius,y:d[1]+ ref.pointRadius,id:i}
         })).enter().append("svg:text")
         .text(function(d,i) {
              if (interpPts[i]==1) return "";  //Don't show the labels of interpolated years
              return ref.labels[d.id];
          }).attr("x", function(d) {return d.x;})
         .attr("y", function (d) {  return d.y; })
         .attr("class","hintLabels")
         .attr("fill-opacity",function (d){ return ((d.id==view)?1:0.5)})
         .attr("id",function (d){return "hintLabels"+ d.id})
         .style("font-family","sans-serif").style("font-size","10px").style("text-anchor","middle")
         .style("fill","#666").on("click", this.clickHintLabelFunction);
 
     //Render the hint path line
     this.svg.select("#hintPath").append("svg:path")
         .attr("d",  this.hintPathGenerator(points))
         .attr("id","path").attr("filter", "url(#blur)")
         .style("fill","none").style("stroke-width",1.5).style("stroke",this.pointColour);
 }
 /** Re-draws a flashlight style hint path as the point is dragged
  *  currentPosition: position of the dragged point
  *  points: all points along the hint path
  * */
 Scatterplot.prototype.drawHintPath_flashlight = function (currentPosition,points){
     this.svg.select("#hintPath").selectAll(".hintLabels").remove();
     this.svg.select("#hintPath").selectAll("path").remove();
     this.hintPathPoints_flashlight = [];
 
     //TODO: ambiguity?
     //var currentPosition = points[view];
     var distances = [];
     for (var i=0;i<points.length;i++){ //Grab the closest n points to the current position
           distances.push([this.calculateDistance(currentPosition[0],currentPosition[1],points[i][0],points[i][1]),i]);
     }
     distances.sort(function(a,b){return a[0]-b[0]}); //Sort ascending
     var maxDistance = distances[4][0]; //For scaling the transparency
 
     var pathPoints = [];
     var ref = this;
     for (var i=0;i<4;i++){ //Start at 1, we know the zero distance will be the first element in the sorted array
         pathPoints.push(points[distances[i][1]]);
         var pointIndex = distances[i][1];
         this.svg.select("#hintPath").append("svg:path")
             .attr("d",  this.hintPathGenerator([points[pointIndex],currentPosition]))
             .attr("id","path").attr("filter", "url(#blurFlashlight)").attr("opacity",Math.abs(1-distances[i][0]/maxDistance))
             .style("fill","none").style("stroke-width",1).style("stroke",this.pointColour);
         this.hintPathPoints_flashlight.push(pointIndex);
     }
 
     //Draw the hint path labels
     this.svg.select("#hintPath").selectAll("text").data(pathPoints.map(function (d,i){
         return {x:d[0],y:d[1],id:ref.hintPathPoints_flashlight[i],id2:i}
     })).enter().append("text").text(function (d){return ref.labels[d.id]}).attr("x", function(d) {return d.x;})
         .attr("y", function (d) {  return d.y; }).attr("class","hintLabels")
         .attr("fill-opacity",function (d) {return Math.abs(1-distances[d.id2][0]/maxDistance)})
         .attr("id",function (d){return "hintLabels"+ d.id})
         .style("font-family","sans-serif").style("font-size","10px").style("text-anchor","middle")
         .style("fill","#666").on("click", this.clickHintLabelFunction);
 }
 /**This function places labels in ambiguous cases such that they do not overlap
  * points: a 2D array of positions of each label [x,y]...
  * */
 Scatterplot.prototype.placeLabels = function (points){
   if (this.isAmbiguous == 0){return points} //No ambiguous cases, don't need to adjust the points
 
   var ref = this;
   var offset = -1;
   var indexCounter = -1;
   var x = 0;
   var y = 0;
   var adjustedPoints = points.map(function (d,i){
       if (ref.ambiguousPoints[i][0] == 1 /**|| ref.ambiguousPoints[i][0] == 2*/){
           if (ref.ambiguousPoints[i][1] != offset){
               indexCounter = -1;
               offset = ref.ambiguousPoints[i][1];
               x= d[0];
               y = d[1];
           }
           indexCounter++;
           return [x + 25*indexCounter,y-10];
       }
       return [d[0],d[1]];
   });
   return adjustedPoints;
 }
 /**This function places labels in ambiguous cases for a flashlight hint path, aligned vertically and equally spaced
  * points: a 2D array of positions of each label [x,y]...
  * */
 Scatterplot.prototype.placeLabels_flashlight= function (points){
     if (this.isAmbiguous == 0){return points} //No ambiguous cases, don't need to adjust the points
 
     var ref = this;
     var offset = -1;
     var indexCounter = -1;
     var x = 0;
     var y = 0;
     var adjustedPoints = points.map(function (d,i){
         if (ref.ambiguousPoints[i][0] == 1 /**|| ref.ambiguousPoints[i][0] == 2*/){
             if (ref.ambiguousPoints[i][1] != offset){
                 indexCounter = -1;
                 offset = ref.ambiguousPoints[i][1];
                 x= d[0];
                 y = d[1];
             }
             indexCounter++;
             return [x ,y+ 25*indexCounter];
         }
         return [d[0],d[1]];
     });
     return adjustedPoints;
 }
 /** Draws interaction loops as svg paths onto the hint path (if point has stationary cases)
  *  id: of the dragged point
  * */
  Scatterplot.prototype.drawLoops = function (id,points){
     //Create a function for drawing a loop around a stationary point, as an interaction path
     var loopGenerator = d3.line().curve(d3.curveBasisClosed); //Closed B-spline
     var ref = this;
 
    //Draw all loops at their respective stationary points
     this.svg.select("#hintPath").selectAll(".loops")
         .data(points.map(function (d,i){
             var loopPoints = [];
             loopPoints = ref.calculateLoopPoints(d[0],d[1],d[2]);
             var x = d[0] + (ref.loopRadius/2)*Math.cos(d[2]);
             var y = d[1] + (ref.loopRadius/2)*Math.sin(d[2]);
             var repeatedYears = [];
             for (var j=0;j<ref.ambiguousPoints.length;j++){
                 if (ref.ambiguousPoints[j][0] == 1 && ref.ambiguousPoints[j][1] == i){
                     repeatedYears.push(j);
                 }
             }
             return {points:loopPoints[0],id:i,orientationAngle:d[2],cx:x,cy:y,points2:loopPoints[1],years:repeatedYears};
         }))
         .enter().append("path").attr("class","loops")
         .attr("d",function (d){return loopGenerator(d.points);})
         .attr("id",function (d,i){return "loop"+i;})
         .style("fill","none").style("stroke","#666").style("stroke-dasharray","3,3")
         .attr("filter", "url(#blurLoop)");
 }
 /** Clears the hint path by removing it, also re-sets the transparency of the faded out points and the isAmbiguous flag */
 Scatterplot.prototype.clearHintPath = function () {
     this.isAmbiguous = 0;
     this.removeAnchor();
 
     //Remove the hint path svg elements
     this.svg.select("#hintPath").selectAll("text").remove();
     this.svg.select("#hintPath").selectAll("path").remove();
     this.svg.select("#hintPath").selectAll("circle").remove();
 
     //Re-set the transparency of faded out points
     this.svg.selectAll(".displayPoints").style("fill-opacity", 1);
 }
 /**Clears the point labels when the background is clicked
  * */
 Scatterplot.prototype.clearPointLabels = function (){
     this.svg.selectAll(".pointLabels").remove();
     this.clickedPoints = [];
 }
 /** Calculates the distance between two points
  * (x1,y1) is the first point
  * (x2,y2) is the second point
  * @return the distance, avoiding the square root
  * */
 Scatterplot.prototype.calculateDistance = function(x1,y1,x2,y2){
     var term1 = x1 - x2;
     var term2 = y1 - y2;
     return (term1*term1)+(term2*term2);
 }
 /** Finds the minimum distance between a point at (x,y), with respect
  * to a line segment defined by points (pt1_x,pt1_y) and (pt2_x,pt2_y)
  * Code based on: http://stackoverflow.com/questions/849211/shortest
  * -distance-between-a-point-and-a-line-segment
  * Formulas can be found at: http://paulbourke.net/geometry/pointlineplane/
  * @return the point on the line at the minimum distance and the t parameter, as an array: [x,y,t]
  * */
 Scatterplot.prototype.minDistancePoint = function(x,y,pt1_x,pt1_y,pt2_x,pt2_y){
 
    var distance = this.calculateDistance(pt1_x,pt1_y,pt2_x,pt2_y);
    //Two points of the line segment are the same
    if (distance == 0) return [pt1_x,pt1_y,0];
 
    var t = ((x - pt1_x) * (pt2_x - pt1_x) + (y - pt1_y) * (pt2_y - pt1_y)) / distance;
    if (t < 0) return [pt1_x,pt1_y,t]; //Point projection goes beyond pt1
    if (t > 1) return [pt2_x,pt2_y,t]; //Point projection goes beyond pt2
 
    //Otherwise, point projection lies on the line somewhere
     var minX = pt1_x + t*(pt2_x-pt1_x);
     var minY = pt1_y + t*(pt2_y-pt1_y);
     return [minX,minY,t];
 }
 /** Computes the points to lie along an interaction loop
  * Note: this function is only called in findLoops()
  * x,y: Define the center point of the loop (sort of)
  * angle: the angle to orient the loop at
  * @return an array of all loop points and the year index in the format: [[x,y], etc.]
  * */
 Scatterplot.prototype.calculateLoopPoints = function (x,y,angle){
    var drawingPoints = [];
     var loopWidth = Math.PI/5; //Change this value to expand/shrink the width of the loop
 
     //The first point of the path should be the original point, as a reference for drawing the loop
     drawingPoints.push([x,y]);
 
     //Generate some polar coordinates to complete the round part of the loop
     drawingPoints.push([(x + this.loopRadius*Math.cos(angle+loopWidth)),(y+ this.loopRadius*Math.sin(angle+loopWidth))]);
     drawingPoints.push([(x + this.loopRadius*Math.cos(angle)),(y+ this.loopRadius*Math.sin(angle))]);
     drawingPoints.push([(x + this.loopRadius*Math.cos(angle-loopWidth)),(y+ this.loopRadius*Math.sin(angle-loopWidth))]);
 
    //The last point of the path should be the original point, as a reference for drawing the loop
    drawingPoints.push([x,y]);
    
    //Hack here!!!- another set of points for handling dragging around loops
     var loopPoints = [];
     loopWidth = Math.PI/7; //Change this value to expand/shrink the width of the loop
     var adjustedRadius = this.loopRadius - 10;
     //The first point of the path should be the original point, as a reference for drawing the loop
     loopPoints.push([x,y]);
 
     //TODO: automatically assign dragging direction to loops
     //Generate some polar coordinates to complete the round part of the loop
     //HACK: use this when dragging segways to the left
     /**loopPoints.push([(x + adjustedRadius*Math.cos(angle+loopWidth)),(y+ adjustedRadius*Math.sin(angle+loopWidth))]);
     loopPoints.push([(x + adjustedRadius*Math.cos(angle)),(y+ adjustedRadius*Math.sin(angle))]);
     loopPoints.push([(x + adjustedRadius*Math.cos(angle-loopWidth)),(y+ adjustedRadius*Math.sin(angle-loopWidth))]);*/
     
     //HACK: use this point order when dragging segways right
     loopPoints.push([(x + adjustedRadius*Math.cos(angle-loopWidth)),(y+ adjustedRadius*Math.sin(angle-loopWidth))]);
     loopPoints.push([(x + adjustedRadius*Math.cos(angle)),(y+ adjustedRadius*Math.sin(angle))]);
     loopPoints.push([(x + adjustedRadius*Math.cos(angle+loopWidth)),(y+ adjustedRadius*Math.sin(angle+loopWidth))]);
     
     //The last point of the path should be the original point, as a reference for drawing the loop
     loopPoints.push([x,y]);
    
    return [drawingPoints,loopPoints];
 }
 /** Search for ambiguous cases in a list of points.  Ambiguous cases are tagged as '1' and non-ambiguous are '0'.
  *  If ambiguous cases are found, draws loops.
  *  This function populates the following global array:
  *  this.ambiguousPoints:[[type,group]..total number of points on hint path], Group is an index indicating
  *  which group stationary points the point belongs to.
  *
  *  id: of the dragged point
  *  points: an array of points to search within for ambiguity
  * */
 Scatterplot.prototype.checkAmbiguous = function (id,points){
     var j, currentPoint;
     var repeatedPoints = [];
     var foundIndex = -1;
     var groupNum = 0;
 
     //Clear and re-set the global arrays
     this.ambiguousPoints = [];
     //this.closePoints = [];
     for (j=0;j<=this.lastView;j++){
         this.ambiguousPoints[j] = [0];
         //this.closePoints[j] = [0];
     }
     var savedIndex= -1;
     //Populate the stationary and revisiting points array
     //Search for points that match in the x and y values (called "stationary points")
     for (j=0;j<=this.lastView;j++){
         currentPoint = points[j];
         for (var k=0;k<=this.lastView;k++){
             if (j!=k){
                 var distance = findPixelDistance(points[k][0],points[k][1],currentPoint[0],currentPoint[1]);
                 if ((points[k][0] == currentPoint[0] && points[k][1] == currentPoint[1])||(distance<=10)){ //A repeated point is found
                     if (Math.abs(k-j)==1){ //Stationary point
                         this.isAmbiguous = 1;
                         if (Math.abs(savedIndex-j)>1 && savedIndex!=-1){
                             groupNum++;
                         }
                         this.ambiguousPoints[j] = [1,groupNum];
                         savedIndex = j;
                     }/**else{ //Found a revisiting point
                         if (this.ambiguousPoints[j][0] ==0){ //Don't want to overwrite a stationary point
                             this.ambiguousPoints[j] = [2,groupNum];
                         }
                     }*/
                 }
             }
         }
     }   //Draw the interaction loop(s) (if any)
     if (this.isAmbiguous == 1){
         //TODO: automatically orient the loops such that they blend with the path
         var currentGroupNum = -1;
         for (var i=0;i<this.ambiguousPoints.length;i++){
             if (this.ambiguousPoints[i].length>1){
                 if (this.ambiguousPoints[i][1]!=currentGroupNum){
                     repeatedPoints.push([points[i][0],points[i][1],Math.PI*3/2]);
                 }
                 currentGroupNum = this.ambiguousPoints[i][1];
             }
         }
         this.drawLoops(id,repeatedPoints);
     }
 }
 /** Search for x,y in a 2D array with the format: [[x,y]..number of points]
  *  x,y: the point to search for
  *  array: the array to search within
  *  @return -1 if no match is found, or the index of the found match
  * */
 Scatterplot.prototype.findInArray = function (x,y,array)
 {
    if (array.length==0) return -1;
    for (var j=0;j<array.length;j++){
       if (array[j][0]==x && array[j][1]==y){
           return j;
       }
    }
     return -1;
 }

 /** Constructor for a slider widget
 * x: the left margin
 * y: the right margin
 * id: id of the div tag to append the svg container
 * labels: an array of labels corresponding to a tick along the slider
 * description: a title for the slider
 * colour: the colour of the slider
 * spacing: spacing between ticks (in pixels)
 */
//TODO: Get rid of magic numbers and find a way to automatically compute them (e.g., positioning of slider and title relative to width)
function Slider(x, y, labels,description,colour,spacing) {
    // Save the position, size and display properties
    this.xpos = x;
    this.ypos = y;
    this.mouseX = -1;
    this.numTicks  = labels.length;
    this.title = description;
    this.tickLabels = labels;
    this.displayColour = colour;
    this.tickSpacing = spacing;
    this.sliderOffset = x+(description.length*20); //Font size of title is 20px
    this.width = this.sliderOffset + this.numTicks*this.tickSpacing;
    this.height = 50;
    this.tickYPos = 35; //Amount to translate the draggable tick by in the y coordinate
    this.anchorYPos = 12; //Amount to translate the anchor which follows the draggable tick when it is not placed on the main slider
    this.sliderHeight = 10; //Thickness of the main slider line
 
    this.currentTick = 0; //Start the slider always at the first tick
    this.nextTick = 1;  //The next tick is after the current one
    this.interpValue=0; //Amount of distance travelled between ticks, used to interpolate other visualizations
    this.widget = null;  // Reference to the main widget
    this.sliderPos = this.sliderOffset; //The starting horizontal position of the slider tick (at the first tick)
    this.timeDirection = 1 //Direction travelling along time line (1 if forward, -1 if backwards)
 
    //Generate an array of x locations for each tick
    this.tickPositions = []; //All x locations of the ticks on the slider
    for (var i=0; i < this.numTicks; i++){
        if (i==0){
             this.tickPositions[i] = this.sliderOffset;
        }else {
              this.tickPositions[i] =  this.tickPositions[i-1] + this.tickSpacing;
        }      
    }     
 }
 /** Append a blank svg and g container to the div tag indicated by "id", this is where the widget
  *  will be drawn.
  * */
 Slider.prototype.init = function() {
    this.widget = d3.select("#mainSvg").append("g").attr("id","gSlider")
        .style("display", "none")
        .attr("width", this.width).attr("height", this.height)
        .attr("transform", "translate(" + this.xpos + "," + this.ypos + ")");
 }
 /** Render the widget onto the svg
  *  Note: no data set is required because it was automatically generated in the constructor
  * */
 Slider.prototype.render = function() {
    var ref = this;
 
    //Add the title beside the slider
    this.widget.append("text").text(this.title).attr("class","slider")
               .attr("x",0).attr("y",20).attr("fill",this.displayColour)
               .style("font-family", "sans-serif").style("font-size","20px");
 
    //Prepare the data for drawing the slider ticks
    this.widget.selectAll("rect")
      .data(this.tickPositions.map(function (d,i) {return {id:i,value:d,label:ref.tickLabels[i]};}))
       .enter().append("g").attr("class","slider");
 
    //Draw the ticks
    this.widget.selectAll("g").append("svg:rect")
       .attr("x", function (d) {return d.value;})
       //.attr("y", function (d,i){return ((i==0)||(i==ref.numTicks-1))?(10-ref.sliderHeight/2):10})
        .attr("y", function (d,i){return (10-ref.sliderHeight/2)})
       .attr("width", 2)//.attr("height", function (d,i){return ((i==0)||(i==ref.numTicks-1))?(12+ref.sliderHeight):12})
        .attr("height", function (d,i){return (12+ref.sliderHeight)})
       .style("fill", ref.displayColour)
       .attr("class","ticks");
 
    //Draw the labels for each tick
    this.widget.selectAll("g").append("svg:text")
       .text(function(d) { return d.label; })
       .attr("x", function(d) {return d.value}).attr("y", 0)
       .style("font-family", "sans-serif").style("font-size", "14px")
       .style("fill", function (d,i){
            if (ref.tickLabels.length >25){ //Only display every 5 labels to reduce clutter
               if (i%5 ==0) return ref.displayColour;
               else return "none";
            }
            return ref.displayColour;
        })
        .attr("text-anchor","middle").attr("class","tickLabels");
 
    //Draw a long line through all ticks
    this.widget.append("rect").attr("class","slider")
        .attr("x",ref.sliderOffset).attr("y",10)
        .attr("width", ref.tickPositions[ref.numTicks-1] - ref.sliderOffset)
        .attr("height", ref.sliderHeight)
        .attr("fill", ref.displayColour);
 
   //Draw the draggable slider tick
   /**this.widget.append("rect")
       .attr("transform", function(d) { return "translate(" +ref.sliderPos + "," + ref.tickYPos + ")"; })
       .attr("rx",4).attr("ry",4) //For curved edges on the rectangle
       .attr("width", 10).attr("height", 20)
       .attr("stroke", "white").attr("fill", ref.displayColour)
       .style("cursor", "pointer").attr("id","slidingTick");*/
 
  //Draw a triangle draggable tick
   this.widget.append("path").attr("d",d3.symbol().type(d3.symbolTriangle).size(180))
       .attr("transform", "translate(" +ref.sliderPos + "," + ref.tickYPos + ")")
       .attr("fill", ref.displayColour).style("stroke","white")
       .style("cursor", "pointer").attr("id","slidingTick").attr("class","slider");
   //Draw an anchor to attach the triangle with the main slider bar
    this.widget.append("rect").attr("transform", "translate(" +(ref.sliderPos+1) + "," + ref.anchorYPos + ")")
         .attr("stroke", "none").style("fill", "#bdbdbd").attr("width", 1).attr("height", (ref.sliderHeight-4))
         .style("cursor", "pointer").attr("id","anchor").attr("class","slider");
 }
 /** Re-draws the dragged tick by translating it according to the x-coordinate of the mouse
  *  mouseX: The x-coordinate of the mouse, received from the drag event
  * */
 Slider.prototype.updateDraggedSlider = function( mouseX ) {
    var ref = this;
   this.mouseX = mouseX; //Save the mouse position
   var translateX;
 
    var current = ref.tickPositions[ref.currentTick];
    var next = ref.tickPositions[ref.nextTick];
    if (ref.currentTick == 0){ //First tick
        if (mouseX <= current){//Out of bounds: Passed first tick
            translateX = current;
        }else if (mouseX >= next){
            ref.currentTick = ref.nextTick;
            ref.nextTick++;
            ref.interpValue = (ref.timeDirection == -1)? 1:0;
            translateX = mouseX;
         }else{
            ref.setInterpolation(mouseX,current,next);
            translateX = mouseX;
         }
    }else if (ref.nextTick == (ref.numTicks-1)){ //Last tick
        if (mouseX>= next){  //Out of bounds: Passed last tick
           translateX = next;
        }else if (mouseX <= current){
             ref.nextTick = ref.currentTick;
             ref.currentTick--;
             ref.interpValue = (ref.timeDirection == -1)? 1:0;
             translateX = mouseX;
        }else{
            ref.setInterpolation(mouseX,current,next);
            translateX = mouseX;
        }
    }else{ //A tick in between the end ticks
         if (mouseX <= current){ //Passed current
             ref.nextTick = ref.currentTick;
             ref.currentTick--;
             ref.interpValue = (ref.timeDirection == -1)? 1:0;
         }else if (mouseX>=next){ //Passed next
             ref.currentTick = ref.nextTick;
             ref.nextTick++;
             ref.interpValue = (ref.timeDirection == -1)? 1:0;
         }else{
             ref.setInterpolation(mouseX,current,next);
         }
       translateX = mouseX;
    }
 
     this.widget.select("#slidingTick").attr("transform","translate(" + translateX + "," + ref.tickYPos + ")");
     this.widget.select("#anchor").attr("width",translateX-ref.sliderOffset);
     //this.widget.select("#anchor").attr("transform", "translate(" + translateX + "," + ref.anchorYPos + ")");
 }
 /** Determines how far the slider has travelled between two ticks (current and next) and sets
  * the interpolation value accordingly (as percentage travelled)
  * current,next: the tick indices
  * mouseX: x-coordinate of mouse
  * */
 Slider.prototype.setInterpolation = function( mouseX,current,next) {
      var totalDistance = Math.abs(next-current);
      var distanceTravelled = Math.abs(mouseX - current);
      var newInterp = distanceTravelled/totalDistance;
 
     this.timeDirection = (newInterp>this.interpValue)?1:(newInterp<this.interpValue)?-1:this.interpValue;
     this.interpValue = newInterp;
 }
 /** Updates the location of the draggable tick to the new view
  * */
 Slider.prototype.updateSlider = function( newView ) {
      var ref = this;
     //Update the view tracker variables
     if (newView == ref.numTicks){  //Last point of path
         ref.nextTick = newView;
         ref.currentTick = newView -1;
     }else { //A point somewhere in the middle
         ref.currentTick = newView;
         ref.nextTick = newView + 1;
     }
     //Redraw the draggable tick at the new view
     this.widget.select("#slidingTick")
                //.attr("x",function (){return ref.tickPositions[newView];});
                 .attr("transform",function (){return "translate(" + ref.tickPositions[newView] + "," + ref.tickYPos + ")";});
     this.widget.select("#anchor").attr("width",this.tickPositions[newView] - this.sliderOffset);
 }
 /** Snaps the draggable tick to the nearest tick on the slider after the mouse is
  *  released
  * */
 Slider.prototype.snapToTick = function() {
      var ref = this;
     this.widget.select("#slidingTick")
         //.attr("x",function (){
         .attr("transform",function (){
          var current = ref.tickPositions[ref.currentTick];
          var next = ref.tickPositions[ref.nextTick];
          var currentDist = Math.abs(current - ref.mouseX);
          var nextDist = Math.abs(next - ref.mouseX);
          if (currentDist > nextDist){
             ref.currentTick = ref.nextTick;
             ref.nextTick++;
             ref.widget.select("#anchor").attr("width",next-ref.sliderOffset);
              return "translate(" + next + "," + ref.tickYPos + ")";
             //return (next-5);
         }
             ref.widget.select("#anchor").attr("width",current-ref.sliderOffset);
             return "translate(" + current + "," + ref.tickYPos + ")";
         //return (current-5);
      });
 
 }
 /** The tick is drawn according the to the provided interpolation amount,
  *  and interpolation occurs between current and next view
  *  Note: This function can be used to update the slider as another visualization
  *  object is dragged (e.g., scatterplot point)
  * */
 Slider.prototype.animateTick = function(interpAmount, currentView, nextView) {
     var ref = this;
     if (interpAmount != 0){
         this.widget.select("#slidingTick")
                .attr("transform",function (){
                      var current = ref.tickPositions[currentView];
                      var next = ref.tickPositions[nextView];
                      var interpX = d3.interpolate(current,next)(interpAmount);
                      ref.widget.select("#anchor").attr("width",interpX-ref.sliderOffset)
                      return "translate("+interpX+","+ref.tickYPos+")";
                  });
     }
 }

 //Dataset courtesy of: Gapminder.org
var data = [{"Country":"Afghanistan","Pop1955":8891209,"Pop1960":9829450,"Pop1965":10997885,"Pop1970":12430623,"Pop1975":14132019,"Pop1980":15112149,"Pop1985":13796928,"Pop1990":14669339,"Pop1995":20881480,"Pop2000":23898198,"Pop2005":29928987,"Group":"South Asia","Cluster":0,"F1950":7.7,"F1955":7.7,"F1960":7.7,"F1965":7.7,"F1970":7.7,"F1975":7.7,"F1980":7.8,"F1985":7.9,"F1990":8,"F1995":8,"F2000":7.4792,"F2005":7.0685,"L1950":28.801,"L1955":30.332,"L1960":31.997,"L1965":34.02,"L1970":36.088,"L1975":38.438,"L1980":39.854,"L1985":40.822,"L1990":41.674,"L1995":41.763,"L2000":42.129,"L2005":43.828},
{"Country":"Argentina","Pop1955":18927821,"Pop1960":20616009,"Pop1965":22283100,"Pop1970":23962313,"Pop1975":26081880,"Pop1980":28369799,"Pop1985":30675059,"Pop1990":33022202,"Pop1995":35311049,"Pop2000":37497728,"Pop2005":39537943,"Group":"America","Cluster":3,"F1950":3.154,"F1955":3.1265,"F1960":3.0895,"F1965":3.049,"F1970":3.1455,"F1975":3.44,"F1980":3.15,"F1985":3.053,"F1990":2.9,"F1995":2.63,"F2000":2.35,"F2005":2.254,"L1950":62.485,"L1955":64.399,"L1960":65.142,"L1965":65.634,"L1970":67.065,"L1975":68.481,"L1980":69.942,"L1985":70.774,"L1990":71.868,"L1995":73.275,"L2000":74.34,"L2005":75.32},
{"Country":"Aruba","Pop1955":53865,"Pop1960":57203,"Pop1965":59020,"Pop1970":59039,"Pop1975":59390,"Pop1980":60266,"Pop1985":64129,"Pop1990":66653,"Pop1995":67836,"Pop2000":69539,"Pop2005":71566,"Group":"America","Cluster":3,"F1950":5.65,"F1955":5.15,"F1960":4.399,"F1965":3.301,"F1970":2.651,"F1975":2.45,"F1980":2.358,"F1985":2.3,"F1990":2.28,"F1995":2.208,"F2000":2.124,"F2005":2.04,"L1950":60.437,"L1955":64.381,"L1960":66.606,"L1965":68.336,"L1970":70.941,"L1975":71.83,"L1980":74.116,"L1985":74.494,"L1990":74.108,"L1995":73.011,"L2000":73.451,"L2005":74.239},
{"Country":"Australia","Pop1955":9277087,"Pop1960":10361273,"Pop1965":11439384,"Pop1970":12660160,"Pop1975":13771400,"Pop1980":14615900,"Pop1985":15788300,"Pop1990":17022133,"Pop1995":18116171,"Pop2000":19164620,"Pop2005":20090437,"Group":"East Asia & Pacific","Cluster":4,"F1950":3.18,"F1955":3.406,"F1960":3.274,"F1965":2.871,"F1970":2.535,"F1975":1.989,"F1980":1.907,"F1985":1.859,"F1990":1.86,"F1995":1.776,"F2000":1.756,"F2005":1.788,"L1950":69.12,"L1955":70.33,"L1960":70.93,"L1965":71.1,"L1970":71.93,"L1975":73.49,"L1980":74.74,"L1985":76.32,"L1990":77.56,"L1995":78.83,"L2000":80.37,"L2005":81.235},
{"Country":"Austria","Pop1955":6946885,"Pop1960":7047437,"Pop1965":7270889,"Pop1970":7467086,"Pop1975":7578903,"Pop1980":7549433,"Pop1985":7559776,"Pop1990":7722953,"Pop1995":8047433,"Pop2000":8113413,"Pop2005":8184691,"Group":"Europe & Central Asia","Cluster":1,"F1950":2.09,"F1955":2.52,"F1960":2.78,"F1965":2.53,"F1970":2.02,"F1975":1.64,"F1980":1.62,"F1985":1.45,"F1990":1.47,"F1995":1.388,"F2000":1.382,"F2005":1.42,"L1950":66.8,"L1955":67.48,"L1960":69.54,"L1965":70.14,"L1970":70.63,"L1975":72.17,"L1980":73.18,"L1985":74.94,"L1990":76.04,"L1995":77.51,"L2000":78.98,"L2005":79.829},
{"Country":"Bahamas","Pop1955":87138,"Pop1960":112234,"Pop1965":139205,"Pop1970":170323,"Pop1975":189139,"Pop1980":209944,"Pop1985":234988,"Pop1990":257253,"Pop1995":275303,"Pop2000":290075,"Pop2005":301790,"Group":"America","Cluster":3,"F1950":4.053,"F1955":4.305,"F1960":4.503,"F1965":3.794,"F1970":3.444,"F1975":3.221,"F1980":3.16,"F1985":2.62,"F1990":2.6,"F1995":2.4,"F2000":2.1111,"F2005":2.0221,"L1950":59.846,"L1955":62.405,"L1960":64.209,"L1965":65.795,"L1970":66.515,"L1975":67.199,"L1980":67.874,"L1985":69.524,"L1990":69.171,"L1995":68.472,"L2000":71.068,"L2005":73.495},
{"Country":"Bangladesh","Pop1955":49601520,"Pop1960":54621538,"Pop1965":60332117,"Pop1970":67402621,"Pop1975":76253310,"Pop1980":88076996,"Pop1985":99752733,"Pop1990":109896945,"Pop1995":119186448,"Pop2000":130406594,"Pop2005":144319628,"Group":"South Asia","Cluster":0,"F1950":6.7,"F1955":6.76,"F1960":6.85,"F1965":6.6,"F1970":6.15,"F1975":5.6,"F1980":5.25,"F1985":4.629,"F1990":4.117,"F1995":3.5043,"F2000":3.224,"F2005":2.826,"L1950":37.484,"L1955":39.348,"L1960":41.216,"L1965":43.453,"L1970":45.252,"L1975":46.923,"L1980":50.009,"L1985":52.819,"L1990":56.018,"L1995":59.412,"L2000":62.013,"L2005":64.062},
{"Country":"Barbados","Pop1955":227255,"Pop1960":232339,"Pop1965":234980,"Pop1970":238756,"Pop1975":247147,"Pop1980":251966,"Pop1985":257446,"Pop1990":262624,"Pop1995":267907,"Pop2000":273483,"Pop2005":278870,"Group":"America","Cluster":3,"F1950":4.67,"F1955":4.67,"F1960":4.26,"F1965":3.45,"F1970":2.74,"F1975":2.19,"F1980":1.92,"F1985":1.75,"F1990":1.6,"F1995":1.5,"F2000":1.5,"F2005":1.5,"L1950":57.22,"L1955":62.57,"L1960":65.87,"L1965":67.62,"L1970":69.42,"L1975":71.27,"L1980":72.695,"L1985":74.027,"L1990":74.894,"L1995":74.912,"L2000":75.97,"L2005":77.296},
{"Country":"Belgium","Pop1955":8868475,"Pop1960":9118700,"Pop1965":9448100,"Pop1970":9637800,"Pop1975":9794800,"Pop1980":9846800,"Pop1985":9858200,"Pop1990":9969310,"Pop1995":10155459,"Pop2000":10263618,"Pop2005":10364388,"Group":"Europe & Central Asia","Cluster":1,"F1950":2.343,"F1955":2.496,"F1960":2.644,"F1965":2.392,"F1970":2.015,"F1975":1.705,"F1980":1.595,"F1985":1.559,"F1990":1.613,"F1995":1.604,"F2000":1.638,"F2005":1.646,"L1950":68,"L1955":69.24,"L1960":70.25,"L1965":70.94,"L1970":71.44,"L1975":72.8,"L1980":73.93,"L1985":75.35,"L1990":76.46,"L1995":77.53,"L2000":78.32,"L2005":79.441},
{"Country":"Bolivia","Pop1955":3074311,"Pop1960":3434073,"Pop1965":3853315,"Pop1970":4346218,"Pop1975":4914316,"Pop1980":5441298,"Pop1985":5934935,"Pop1990":6573900,"Pop1995":7376582,"Pop2000":8152620,"Pop2005":8857870,"Group":"America","Cluster":3,"F1950":6.75,"F1955":6.75,"F1960":6.63,"F1965":6.56,"F1970":6.5,"F1975":5.8,"F1980":5.2995,"F1985":5,"F1990":4.8,"F1995":4.324,"F2000":3.9585,"F2005":3.5,"L1950":40.414,"L1955":41.89,"L1960":43.428,"L1965":45.032,"L1970":46.714,"L1975":50.023,"L1980":53.859,"L1985":57.251,"L1990":59.957,"L1995":62.05,"L2000":63.883,"L2005":65.554},
{"Country":"Brazil","Pop1955":61773546,"Pop1960":71694810,"Pop1965":83092908,"Pop1970":95684297,"Pop1975":108823732,"Pop1980":122958132,"Pop1985":137302933,"Pop1990":151083809,"Pop1995":163542501,"Pop2000":175552771,"Pop2005":186112794,"Group":"America","Cluster":3,"F1950":6.1501,"F1955":6.1501,"F1960":6.1501,"F1965":5.38,"F1970":4.7175,"F1975":4.305,"F1980":3.8,"F1985":3.1,"F1990":2.6,"F1995":2.45,"F2000":2.345,"F2005":2.245,"L1950":50.917,"L1955":53.285,"L1960":55.665,"L1965":57.632,"L1970":59.504,"L1975":61.489,"L1980":63.336,"L1985":65.205,"L1990":67.057,"L1995":69.388,"L2000":71.006,"L2005":72.39},
{"Country":"Canada","Pop1955":16050356,"Pop1960":18266765,"Pop1965":20071104,"Pop1970":21749986,"Pop1975":23209200,"Pop1980":24593300,"Pop1985":25941600,"Pop1990":27790600,"Pop1995":29619002,"Pop2000":31278097,"Pop2005":32805041,"Group":"America","Cluster":3,"F1950":3.645,"F1955":3.882,"F1960":3.675,"F1965":2.61,"F1970":1.976,"F1975":1.734,"F1980":1.634,"F1985":1.616,"F1990":1.694,"F1995":1.564,"F2000":1.522,"F2005":1.527,"L1950":68.75,"L1955":69.96,"L1960":71.3,"L1965":72.13,"L1970":72.88,"L1975":74.21,"L1980":75.76,"L1985":76.86,"L1990":77.95,"L1995":78.61,"L2000":79.77,"L2005":80.653},
{"Country":"Chile","Pop1955":6743269,"Pop1960":7585349,"Pop1965":8509950,"Pop1970":9368558,"Pop1975":10251542,"Pop1980":11093718,"Pop1985":12066701,"Pop1990":13127760,"Pop1995":14205449,"Pop2000":15153450,"Pop2005":15980912,"Group":"America","Cluster":3,"F1950":4.95,"F1955":5.486,"F1960":5.4385,"F1965":4.4405,"F1970":3.63,"F1975":2.803,"F1980":2.671,"F1985":2.65,"F1990":2.55,"F1995":2.21,"F2000":2,"F2005":1.944,"L1950":54.745,"L1955":56.074,"L1960":57.924,"L1965":60.523,"L1970":63.441,"L1975":67.052,"L1980":70.565,"L1985":72.492,"L1990":74.126,"L1995":75.816,"L2000":77.86,"L2005":78.553},
{"Country":"China","Pop1955":608655000,"Pop1960":667070000,"Pop1965":715185000,"Pop1970":818315000,"Pop1975":916395000,"Pop1980":981235000,"Pop1985":1051040000,"Pop1990":1135185000,"Pop1995":1204855000,"Pop2000":1262645000,"Pop2005":1303182268,"Group":"East Asia & Pacific","Cluster":4,"F1950":6.22,"F1955":5.59,"F1960":5.72,"F1965":6.06,"F1970":4.86,"F1975":3.32,"F1980":2.55,"F1985":2.46,"F1990":1.92,"F1995":1.781,"F2000":1.7,"F2005":1.725,"L1950":null,"L1955":50.54896,"L1960":44.50136,"L1965":58.38112,"L1970":63.11888,"L1975":63.96736,"L1980":65.525,"L1985":67.274,"L1990":68.69,"L1995":70.426,"L2000":72.028,"L2005":72.961},
{"Country":"Colombia","Pop1955":13588405,"Pop1960":15952727,"Pop1965":18646175,"Pop1970":21429658,"Pop1975":24114177,"Pop1980":26582811,"Pop1985":29678395,"Pop1990":32858579,"Pop1995":36280883,"Pop2000":39685655,"Pop2005":42954279,"Group":"America","Cluster":3,"F1950":6.76,"F1955":6.76,"F1960":6.76,"F1965":6.18,"F1970":5.0005,"F1975":4.3385,"F1980":3.685,"F1985":3.172,"F1990":2.93005,"F1995":2.7,"F2000":2.4705,"F2005":2.2205,"L1950":50.643,"L1955":55.118,"L1960":57.863,"L1965":59.963,"L1970":61.623,"L1975":63.837,"L1980":66.653,"L1985":67.768,"L1990":68.421,"L1995":70.313,"L2000":71.682,"L2005":72.889},
{"Country":"Costa Rica","Pop1955":1031782,"Pop1960":1248022,"Pop1965":1487605,"Pop1970":1735523,"Pop1975":1991580,"Pop1980":2299124,"Pop1985":2643808,"Pop1990":3027175,"Pop1995":3383786,"Pop2000":3710558,"Pop2005":4016173,"Group":"America","Cluster":3,"F1950":6.7235,"F1955":7.1135,"F1960":7.2245,"F1965":5.801,"F1970":4.346,"F1975":3.7755,"F1980":3.527,"F1985":3.374,"F1990":2.945,"F1995":2.5835,"F2000":2.2815,"F2005":2.0985,"L1950":57.206,"L1955":60.026,"L1960":62.842,"L1965":65.424,"L1970":67.849,"L1975":70.75,"L1980":73.45,"L1985":74.752,"L1990":75.713,"L1995":77.26,"L2000":78.123,"L2005":78.782},
{"Country":"Croatia","Pop1955":3955526,"Pop1960":4036145,"Pop1965":4133313,"Pop1970":4205389,"Pop1975":4255000,"Pop1980":4383000,"Pop1985":4457874,"Pop1990":4508347,"Pop1995":4496683,"Pop2000":4410830,"Pop2005":4495904,"Group":"Europe & Central Asia","Cluster":1,"F1950":2.76,"F1955":2.42,"F1960":2.27,"F1965":2.09,"F1970":1.96,"F1975":2.02,"F1980":1.96,"F1985":1.84,"F1990":1.52,"F1995":1.537,"F2000":1.348,"F2005":1.346,"L1950":61.21,"L1955":64.77,"L1960":67.13,"L1965":68.5,"L1970":69.61,"L1975":70.64,"L1980":70.46,"L1985":71.52,"L1990":72.527,"L1995":73.68,"L2000":74.876,"L2005":75.748},
{"Country":"Cuba","Pop1955":6381106,"Pop1960":7027210,"Pop1965":7809916,"Pop1970":8542746,"Pop1975":9290074,"Pop1980":9652975,"Pop1985":10078658,"Pop1990":10544793,"Pop1995":10896802,"Pop2000":11134273,"Pop2005":11346670,"Group":"America","Cluster":3,"F1950":4.15,"F1955":3.6995,"F1960":4.6805,"F1965":4.3,"F1970":3.6,"F1975":2.15,"F1980":1.8495,"F1985":1.8495,"F1990":1.6505,"F1995":1.6095,"F2000":1.63,"F2005":1.49,"L1950":59.421,"L1955":62.325,"L1960":65.246,"L1965":68.29,"L1970":70.723,"L1975":72.649,"L1980":73.717,"L1985":74.174,"L1990":74.414,"L1995":76.151,"L2000":77.158,"L2005":78.273},
{"Country":"Dominican Republic","Pop1955":2737257,"Pop1960":3231488,"Pop1965":3805881,"Pop1970":4422755,"Pop1975":5048499,"Pop1980":5696855,"Pop1985":6377765,"Pop1990":7077651,"Pop1995":7730224,"Pop2000":8385828,"Pop2005":9049595,"Group":"America","Cluster":3,"F1950":7.5995,"F1955":7.6405,"F1960":7.3505,"F1965":6.6495,"F1970":5.71,"F1975":4.76,"F1980":4,"F1985":3.47,"F1990":3.1995,"F1995":3.05,"F2000":2.95,"F2005":2.81,"L1950":45.928,"L1955":49.828,"L1960":53.459,"L1965":56.751,"L1970":59.631,"L1975":61.788,"L1980":63.727,"L1985":66.046,"L1990":68.457,"L1995":69.957,"L2000":70.847,"L2005":72.235},
{"Country":"Ecuador","Pop1955":3842399,"Pop1960":4415956,"Pop1965":5117779,"Pop1970":5939246,"Pop1975":6871698,"Pop1980":7920499,"Pop1985":9061664,"Pop1990":10318036,"Pop1995":11438004,"Pop2000":12505204,"Pop2005":13363593,"Group":"America","Cluster":3,"F1950":6.7,"F1955":6.7,"F1960":6.7,"F1965":6.5,"F1970":6.0005,"F1975":5.4005,"F1980":4.7005,"F1985":4,"F1990":3.4005,"F1995":3.1,"F2000":2.8175,"F2005":2.578,"L1950":48.357,"L1955":51.356,"L1960":54.64,"L1965":56.678,"L1970":58.796,"L1975":61.31,"L1980":64.342,"L1985":67.231,"L1990":69.613,"L1995":72.312,"L2000":74.173,"L2005":74.994},
{"Country":"Egypt","Pop1955":23855527,"Pop1960":26846610,"Pop1965":30265148,"Pop1970":33574026,"Pop1975":36952499,"Pop1980":42634215,"Pop1985":50052381,"Pop1990":56694413,"Pop1995":63321615,"Pop2000":70492342,"Pop2005":77505756,"Group":"Middle East & North Africa","Cluster":5,"F1950":6.56,"F1955":6.97,"F1960":7.073,"F1965":6.56,"F1970":5.855,"F1975":5.609,"F1980":5.332,"F1985":4.833,"F1990":3.908,"F1995":3.5,"F2000":3.174,"F2005":2.891,"L1950":41.893,"L1955":44.444,"L1960":46.992,"L1965":49.293,"L1970":51.137,"L1975":53.319,"L1980":56.006,"L1985":59.797,"L1990":63.674,"L1995":67.217,"L2000":69.806,"L2005":71.338},
{"Country":"El Salvador","Pop1955":2221139,"Pop1960":2581583,"Pop1965":3017852,"Pop1970":3603907,"Pop1975":4071179,"Pop1980":4566199,"Pop1985":4664361,"Pop1990":5099884,"Pop1995":5568437,"Pop2000":6122515,"Pop2005":6704932,"Group":"America","Cluster":3,"F1950":6.4575,"F1955":6.8065,"F1960":6.847,"F1965":6.621,"F1970":6.0995,"F1975":5.5996,"F1980":4.5,"F1985":3.901,"F1990":3.52,"F1995":3.17,"F2000":2.883,"F2005":2.6825,"L1950":45.262,"L1955":48.57,"L1960":52.307,"L1965":55.855,"L1970":58.207,"L1975":56.696,"L1980":56.604,"L1985":63.154,"L1990":66.798,"L1995":69.535,"L2000":70.734,"L2005":71.878},
{"Country":"Finland","Pop1955":4234900,"Pop1960":4429600,"Pop1965":4563732,"Pop1970":4606307,"Pop1975":4711439,"Pop1980":4779535,"Pop1985":4901783,"Pop1990":4986431,"Pop1995":5104654,"Pop2000":5168595,"Pop2005":5223442,"Group":"Europe & Central Asia","Cluster":1,"F1950":2.997,"F1955":2.769,"F1960":2.66,"F1965":2.191,"F1970":1.623,"F1975":1.663,"F1980":1.685,"F1985":1.66,"F1990":1.819,"F1995":1.743,"F2000":1.754,"F2005":1.825,"L1950":66.55,"L1955":67.49,"L1960":68.75,"L1965":69.83,"L1970":70.87,"L1975":72.52,"L1980":74.55,"L1985":74.83,"L1990":75.7,"L1995":77.13,"L2000":78.37,"L2005":79.313},
{"Country":"France","Pop1955":43427669,"Pop1960":45670000,"Pop1965":48763000,"Pop1970":50787000,"Pop1975":52758427,"Pop1980":53869743,"Pop1985":55171224,"Pop1990":56735161,"Pop1995":58149727,"Pop2000":59381628,"Pop2005":60656178,"Group":"Europe & Central Asia","Cluster":1,"F1950":2.726,"F1955":2.712,"F1960":2.85,"F1965":2.607,"F1970":2.31,"F1975":1.862,"F1980":1.866,"F1985":1.805,"F1990":1.713,"F1995":1.7624,"F2000":1.8833,"F2005":1.8916,"L1950":67.41,"L1955":68.93,"L1960":70.51,"L1965":71.55,"L1970":72.38,"L1975":73.83,"L1980":74.89,"L1985":76.34,"L1990":77.46,"L1995":78.64,"L2000":79.59,"L2005":80.657},
{"Country":"Georgia","Pop1955":3827154,"Pop1960":4146570,"Pop1965":4464959,"Pop1970":4694491,"Pop1975":4897656,"Pop1980":5045697,"Pop1985":5192957,"Pop1990":5426207,"Pop1995":5012952,"Pop2000":4777209,"Pop2005":4677401,"Group":"Europe & Central Asia","Cluster":1,"F1950":3,"F1955":2.909,"F1960":2.979,"F1965":2.611,"F1970":2.601,"F1975":2.39,"F1980":2.269,"F1985":2.263,"F1990":1.95,"F1995":1.58,"F2000":1.478,"F2005":1.407,"L1950":60.616,"L1955":62.625,"L1960":64.644,"L1965":66.654,"L1970":68.158,"L1975":69.634,"L1980":69.638,"L1985":70.45,"L1990":70.465,"L1995":70.49,"L2000":70.476,"L2005":70.987},
{"Country":"Germany","Pop1955":70195612,"Pop1960":72480869,"Pop1965":75638851,"Pop1970":77783164,"Pop1975":78682325,"Pop1980":78297904,"Pop1985":77684907,"Pop1990":79380394,"Pop1995":81653702,"Pop2000":82187909,"Pop2005":82431390,"Group":"Europe & Central Asia","Cluster":1,"F1950":2.16,"F1955":2.3,"F1960":2.49,"F1965":2.32,"F1970":1.64,"F1975":1.52,"F1980":1.46,"F1985":1.43,"F1990":1.31,"F1995":1.34,"F2000":1.346,"F2005":1.36,"L1950":67.5,"L1955":69.1,"L1960":70.3,"L1965":70.8,"L1970":71,"L1975":72.5,"L1980":73.8,"L1985":74.847,"L1990":76.07,"L1995":77.34,"L2000":78.67,"L2005":79.406},
{"Country":"Greece","Pop1955":7965538,"Pop1960":8327405,"Pop1965":8550333,"Pop1970":8792806,"Pop1975":9046542,"Pop1980":9642505,"Pop1985":9923253,"Pop1990":10129603,"Pop1995":10457554,"Pop2000":10559110,"Pop2005":10668354,"Group":"Europe & Central Asia","Cluster":1,"F1950":2.29,"F1955":2.27,"F1960":2.2,"F1965":2.38,"F1970":2.32,"F1975":2.32,"F1980":1.96,"F1985":1.53,"F1990":1.37,"F1995":1.296,"F2000":1.277,"F2005":1.325,"L1950":65.86,"L1955":67.86,"L1960":69.51,"L1965":71,"L1970":72.34,"L1975":73.68,"L1980":75.24,"L1985":76.67,"L1990":77.03,"L1995":77.869,"L2000":78.256,"L2005":79.483},
{"Country":"Grenada","Pop1955":84621,"Pop1960":90148,"Pop1965":93290,"Pop1970":95410,"Pop1975":95819,"Pop1980":90164,"Pop1985":92203,"Pop1990":92360,"Pop1995":90603,"Pop2000":89312,"Pop2005":89502,"Group":"America","Cluster":3,"F1950":5.8,"F1955":6.7,"F1960":6.4,"F1965":4.8,"F1970":4.6,"F1975":4.3,"F1980":4.23,"F1985":4.14,"F1990":3.26,"F1995":2.814,"F2000":2.429,"F2005":2.302,"L1950":62.632,"L1955":63.114,"L1960":63.608,"L1965":64.091,"L1970":64.577,"L1975":65.035,"L1980":65.503,"L1985":66.002,"L1990":66.469,"L1995":66.986,"L2000":67.746,"L2005":68.724},
{"Country":"Haiti","Pop1955":3376419,"Pop1960":3722743,"Pop1965":4137405,"Pop1970":4604915,"Pop1975":4828338,"Pop1980":5029725,"Pop1985":5517977,"Pop1990":6126101,"Pop1995":6675578,"Pop2000":7306302,"Pop2005":8121622,"Group":"America","Cluster":3,"F1950":6.3,"F1955":6.3,"F1960":6.3,"F1965":6,"F1970":5.6005,"F1975":5.8,"F1980":6.2099,"F1985":5.69985,"F1990":5.14985,"F1995":4.61995,"F2000":4,"F2005":3.5445,"L1950":37.579,"L1955":40.696,"L1960":43.59,"L1965":46.243,"L1970":48.042,"L1975":49.923,"L1980":51.461,"L1985":53.636,"L1990":55.089,"L1995":56.671,"L2000":58.137,"L2005":60.916},
{"Country":"Hong Kong","Pop1955":2490400,"Pop1960":3075300,"Pop1965":3597900,"Pop1970":3959000,"Pop1975":4395800,"Pop1980":5063100,"Pop1985":5456200,"Pop1990":5687959,"Pop1995":6225347,"Pop2000":6658720,"Pop2005":6898686,"Group":"East Asia & Pacific","Cluster":4,"F1950":4.44,"F1955":4.72,"F1960":5.31,"F1965":4.02,"F1970":2.89,"F1975":2.32,"F1980":1.8,"F1985":1.31,"F1990":1.288,"F1995":1.08,"F2000":0.94,"F2005":0.966,"L1950":60.96,"L1955":64.75,"L1960":67.65,"L1965":70,"L1970":72,"L1975":73.6,"L1980":75.45,"L1985":76.2,"L1990":77.601,"L1995":80,"L2000":81.495,"L2005":82.208},
{"Country":"Iceland","Pop1955":158044,"Pop1960":175860,"Pop1965":192288,"Pop1970":204104,"Pop1975":218031,"Pop1980":228161,"Pop1985":241403,"Pop1990":254719,"Pop1995":267527,"Pop2000":281043,"Pop2005":296737,"Group":"Europe & Central Asia","Cluster":1,"F1950":3.7,"F1955":4.023,"F1960":3.943,"F1965":3.154,"F1970":2.843,"F1975":2.287,"F1980":2.248,"F1985":2.116,"F1990":2.194,"F1995":2.056,"F2000":1.993,"F2005":2.052,"L1950":72.49,"L1955":73.47,"L1960":73.68,"L1965":73.73,"L1970":74.46,"L1975":76.11,"L1980":76.99,"L1985":77.23,"L1990":78.77,"L1995":78.95,"L2000":80.5,"L2005":81.757},
{"Country":"India","Pop1955":393000000,"Pop1960":434000000,"Pop1965":485000000,"Pop1970":541000000,"Pop1975":607000000,"Pop1980":679000000,"Pop1985":755000000,"Pop1990":839000000,"Pop1995":927000000,"Pop2000":1007702000,"Pop2005":1080264388,"Group":"South Asia","Cluster":0,"F1950":5.9136,"F1955":5.8961,"F1960":5.8216,"F1965":5.6058,"F1970":5.264,"F1975":4.8888,"F1980":4.4975,"F1985":4.15,"F1990":3.8648,"F1995":3.4551,"F2000":3.1132,"F2005":2.8073,"L1950":37.373,"L1955":40.249,"L1960":43.605,"L1965":47.193,"L1970":50.651,"L1975":54.208,"L1980":56.596,"L1985":58.553,"L1990":60.223,"L1995":61.765,"L2000":62.879,"L2005":64.698},
{"Country":"Indonesia","Pop1955":86807000,"Pop1960":95254000,"Pop1965":105093000,"Pop1970":116044000,"Pop1975":130297000,"Pop1980":146995000,"Pop1985":163403000,"Pop1990":178500000,"Pop1995":194755000,"Pop2000":206265000,"Pop2005":218465000,"Group":"East Asia & Pacific","Cluster":4,"F1950":5.486,"F1955":5.672,"F1960":5.62,"F1965":5.568,"F1970":5.3,"F1975":4.73,"F1980":4.109,"F1985":3.4,"F1990":2.9,"F1995":2.55,"F2000":2.3761,"F2005":2.182,"L1950":37.468,"L1955":39.918,"L1960":42.518,"L1965":45.964,"L1970":49.203,"L1975":52.702,"L1980":56.159,"L1985":60.137,"L1990":62.681,"L1995":66.041,"L2000":68.588,"L2005":70.65},
{"Country":"Iran","Pop1955":18729000,"Pop1960":21577000,"Pop1965":25000000,"Pop1970":28933000,"Pop1975":33379000,"Pop1980":39583397,"Pop1985":48439952,"Pop1990":57035717,"Pop1995":61628116,"Pop2000":65660289,"Pop2005":68017860,"Group":"Middle East & North Africa","Cluster":5,"F1950":7,"F1955":7,"F1960":7,"F1965":6.8,"F1970":6.4,"F1975":6.5,"F1980":6.63,"F1985":5.62,"F1990":4.328,"F1995":2.534,"F2000":2.124,"F2005":2.04,"L1950":44.869,"L1955":47.181,"L1960":49.325,"L1965":52.469,"L1970":55.234,"L1975":57.702,"L1980":59.62,"L1985":63.04,"L1990":65.742,"L1995":68.042,"L2000":69.451,"L2005":70.964},
{"Country":"Iraq","Pop1955":5903253,"Pop1960":6822030,"Pop1965":7970746,"Pop1970":9413671,"Pop1975":11117804,"Pop1980":13232839,"Pop1985":15693620,"Pop1990":18134702,"Pop1995":19557247,"Pop2000":22675617,"Pop2005":26074906,"Group":"Middle East & North Africa","Cluster":5,"F1950":7.3,"F1955":7.3,"F1960":7.25,"F1965":7.2,"F1970":7.15,"F1975":6.8,"F1980":6.35,"F1985":6.15,"F1990":5.7,"F1995":5.37,"F2000":4.858,"F2005":4.264,"L1950":45.32,"L1955":48.437,"L1960":51.457,"L1965":54.459,"L1970":56.95,"L1975":60.413,"L1980":62.038,"L1985":65.044,"L1990":59.461,"L1995":58.811,"L2000":57.046,"L2005":59.545},
{"Country":"Ireland","Pop1955":2916133,"Pop1960":2832000,"Pop1965":2876000,"Pop1970":2950100,"Pop1975":3177300,"Pop1980":3401000,"Pop1985":3540000,"Pop1990":3508200,"Pop1995":3613890,"Pop2000":3791690,"Pop2005":4015676,"Group":"Europe & Central Asia","Cluster":1,"F1950":3.38,"F1955":3.68,"F1960":3.979,"F1965":3.873,"F1970":3.815,"F1975":3.478,"F1980":2.877,"F1985":2.287,"F1990":1.969,"F1995":1.9,"F2000":1.969,"F2005":1.964,"L1950":66.91,"L1955":68.9,"L1960":70.29,"L1965":71.08,"L1970":71.28,"L1975":72.03,"L1980":73.1,"L1985":74.36,"L1990":75.467,"L1995":76.122,"L2000":77.783,"L2005":78.885},
{"Country":"Israel","Pop1955":1772032,"Pop1960":2141495,"Pop1965":2578184,"Pop1970":2903434,"Pop1975":3354242,"Pop1980":3737473,"Pop1985":4074965,"Pop1990":4512068,"Pop1995":5305120,"Pop2000":5842454,"Pop2005":6276883,"Group":"Middle East & North Africa","Cluster":5,"F1950":4.161,"F1955":3.893,"F1960":3.852,"F1965":3.79,"F1970":3.77,"F1975":3.409,"F1980":3.125,"F1985":3.051,"F1990":2.933,"F1995":2.942,"F2000":2.906,"F2005":2.75,"L1950":65.39,"L1955":67.84,"L1960":69.39,"L1965":70.75,"L1970":71.63,"L1975":73.06,"L1980":74.45,"L1985":75.6,"L1990":76.93,"L1995":78.269,"L2000":79.696,"L2005":80.745},
{"Country":"Italy","Pop1955":48633000,"Pop1960":50197600,"Pop1965":51987100,"Pop1970":53661100,"Pop1975":55571894,"Pop1980":56451247,"Pop1985":56731215,"Pop1990":56742886,"Pop1995":57274531,"Pop2000":57719337,"Pop2005":58103033,"Group":"Europe & Central Asia","Cluster":1,"F1950":2.321,"F1955":2.35,"F1960":2.498,"F1965":2.493,"F1970":2.325,"F1975":1.889,"F1980":1.53,"F1985":1.349,"F1990":1.275,"F1995":1.213,"F2000":1.286,"F2005":1.379,"L1950":65.94,"L1955":67.81,"L1960":69.24,"L1965":71.06,"L1970":72.19,"L1975":73.48,"L1980":74.98,"L1985":76.42,"L1990":77.44,"L1995":78.82,"L2000":80.24,"L2005":80.546},
{"Country":"Jamaica","Pop1955":1488805,"Pop1960":1631784,"Pop1965":1777397,"Pop1970":1943787,"Pop1975":2104879,"Pop1980":2228803,"Pop1985":2318652,"Pop1990":2347922,"Pop1995":2469389,"Pop2000":2615467,"Pop2005":2735520,"Group":"America","Cluster":3,"F1950":4.22,"F1955":5.08,"F1960":5.64,"F1965":5.78,"F1970":5,"F1975":4,"F1980":3.55,"F1985":3.1,"F1990":2.84,"F1995":2.67,"F2000":2.628,"F2005":2.4289,"L1950":58.53,"L1955":62.61,"L1960":65.61,"L1965":67.51,"L1970":69,"L1975":70.11,"L1980":71.21,"L1985":71.77,"L1990":71.766,"L1995":72.262,"L2000":72.047,"L2005":72.567},
{"Country":"Japan","Pop1955":89815060,"Pop1960":94091638,"Pop1965":98882534,"Pop1970":104344973,"Pop1975":111573116,"Pop1980":116807309,"Pop1985":120754335,"Pop1990":123537399,"Pop1995":125341354,"Pop2000":126699784,"Pop2005":127417244,"Group":"East Asia & Pacific","Cluster":4,"F1950":2.75,"F1955":2.08,"F1960":2.02,"F1965":2,"F1970":2.07,"F1975":1.81,"F1980":1.76,"F1985":1.66,"F1990":1.49,"F1995":1.39,"F2000":1.291,"F2005":1.27,"L1950":63.03,"L1955":65.5,"L1960":68.73,"L1965":71.43,"L1970":73.42,"L1975":75.38,"L1980":77.11,"L1985":78.67,"L1990":79.36,"L1995":80.69,"L2000":82,"L2005":82.603},
{"Country":"Kenya","Pop1955":7033999,"Pop1960":8156827,"Pop1965":9549179,"Pop1970":11247182,"Pop1975":13433414,"Pop1980":16331401,"Pop1985":19763285,"Pop1990":23358413,"Pop1995":27060142,"Pop2000":29985839,"Pop2005":33829590,"Group":"Sub-Saharan Africa","Cluster":2,"F1950":7.511,"F1955":7.816,"F1960":8.12,"F1965":8.12,"F1970":8,"F1975":7.6,"F1980":7.2,"F1985":6.5,"F1990":5.4,"F1995":5,"F2000":5,"F2005":4.959,"L1950":42.27,"L1955":44.686,"L1960":47.949,"L1965":50.654,"L1970":53.559,"L1975":56.155,"L1980":58.766,"L1985":59.339,"L1990":59.285,"L1995":54.407,"L2000":50.992,"L2005":54.11},
{"Country":"South Korea","Pop1955":8839427,"Pop1960":10391909,"Pop1965":11868751,"Pop1970":13911902,"Pop1975":15801308,"Pop1980":17113626,"Pop1985":18481420,"Pop1990":20018546,"Pop1995":21561856,"Pop2000":21647682,"Pop2005":22912177,"Group":"East Asia & Pacific","Cluster":4,"F1950":2.7,"F1955":3.8,"F1960":3.41,"F1965":4.09,"F1970":3.72,"F1975":2.58,"F1980":2.93,"F1985":2.45,"F1990":2.35,"F1995":2.0938,"F2000":1.9173,"F2005":1.85,"L1950":50.056,"L1955":54.081,"L1960":56.656,"L1965":59.942,"L1970":63.983,"L1975":67.159,"L1980":69.1,"L1985":70.647,"L1990":69.978,"L1995":67.727,"L2000":66.662,"L2005":67.297},
{"Country":"North Korea","Pop1955":21551834,"Pop1960":24784140,"Pop1965":28705000,"Pop1970":32241000,"Pop1975":35281000,"Pop1980":38124000,"Pop1985":40806000,"Pop1990":42869000,"Pop1995":45264146,"Pop2000":47351083,"Pop2005":48640671,"Group":"East Asia & Pacific","Cluster":4,"F1950":5.4,"F1955":6.332,"F1960":5.63,"F1965":4.708,"F1970":4.281,"F1975":2.919,"F1980":2.234,"F1985":1.601,"F1990":1.696,"F1995":1.514,"F2000":1.242,"F2005":1.21,"L1950":47.453,"L1955":52.681,"L1960":55.292,"L1965":57.716,"L1970":62.612,"L1975":64.766,"L1980":67.123,"L1985":69.81,"L1990":72.244,"L1995":74.647,"L2000":77.045,"L2005":78.623},
{"Country":"Lebanon","Pop1955":1560985,"Pop1960":1786235,"Pop1965":2057945,"Pop1970":2383029,"Pop1975":3098159,"Pop1980":3085876,"Pop1985":3088235,"Pop1990":3147267,"Pop1995":3334733,"Pop2000":3578036,"Pop2005":3826018,"Group":"Middle East & North Africa","Cluster":5,"F1950":5.74,"F1955":5.72,"F1960":5.689,"F1965":5.336,"F1970":4.78,"F1975":4.311,"F1980":3.895,"F1985":3.313,"F1990":3,"F1995":2.695,"F2000":2.319,"F2005":2.209,"L1950":55.928,"L1955":59.489,"L1960":62.094,"L1965":63.87,"L1970":65.421,"L1975":66.099,"L1980":66.983,"L1985":67.926,"L1990":69.292,"L1995":70.265,"L2000":71.028,"L2005":71.993},
{"Country":"Mexico","Pop1955":32929914,"Pop1960":38578505,"Pop1965":45142399,"Pop1970":52775158,"Pop1975":60678045,"Pop1980":68347479,"Pop1985":76767225,"Pop1990":84913652,"Pop1995":92880353,"Pop2000":99926620,"Pop2005":106202903,"Group":"America","Cluster":3,"F1950":6.7,"F1955":6.8,"F1960":6.7495,"F1965":6.7495,"F1970":6.5,"F1975":5.2505,"F1980":4.25,"F1985":3.6295,"F1990":3.1905,"F1995":2.6705,"F2000":2.4005,"F2005":2.211,"L1950":50.789,"L1955":55.19,"L1960":58.299,"L1965":60.11,"L1970":62.361,"L1975":65.032,"L1980":67.405,"L1985":69.498,"L1990":71.455,"L1995":73.67,"L2000":74.902,"L2005":76.195},
{"Country":"Netherlands","Pop1955":10750842,"Pop1960":11486000,"Pop1965":12292000,"Pop1970":13032335,"Pop1975":13653438,"Pop1980":14143901,"Pop1985":14491380,"Pop1990":14951510,"Pop1995":15459054,"Pop2000":15907853,"Pop2005":16407491,"Group":"Europe & Central Asia","Cluster":1,"F1950":3.062,"F1955":3.095,"F1960":3.168,"F1965":2.797,"F1970":2.059,"F1975":1.596,"F1980":1.515,"F1985":1.555,"F1990":1.583,"F1995":1.6,"F2000":1.726,"F2005":1.721,"L1950":72.13,"L1955":72.99,"L1960":73.23,"L1965":73.82,"L1970":73.75,"L1975":75.24,"L1980":76.05,"L1985":76.83,"L1990":77.42,"L1995":78.03,"L2000":78.53,"L2005":79.762},
{"Country":"New Zealand","Pop1955":2136168,"Pop1960":2371746,"Pop1965":2640400,"Pop1970":2828050,"Pop1975":3117800,"Pop1980":3170150,"Pop1985":3298050,"Pop1990":3359604,"Pop1995":3565990,"Pop2000":3819762,"Pop2005":4035461,"Group":"East Asia & Pacific","Cluster":4,"F1950":3.688,"F1955":4.07,"F1960":4.022,"F1965":3.348,"F1970":2.843,"F1975":2.178,"F1980":1.963,"F1985":2.053,"F1990":2.061,"F1995":1.952,"F2000":1.964,"F2005":1.994,"L1950":69.39,"L1955":70.26,"L1960":71.24,"L1965":71.52,"L1970":71.89,"L1975":72.22,"L1980":73.84,"L1985":74.32,"L1990":76.33,"L1995":77.55,"L2000":79.11,"L2005":80.204},
{"Country":"Nigeria","Pop1955":35458978,"Pop1960":39914593,"Pop1965":45020052,"Pop1970":51027516,"Pop1975":58522112,"Pop1980":68550274,"Pop1985":77573154,"Pop1990":88510354,"Pop1995":100960105,"Pop2000":114306700,"Pop2005":128765768,"Group":"Sub-Saharan Africa","Cluster":2,"F1950":6.9,"F1955":6.9,"F1960":6.9,"F1965":6.9,"F1970":6.9,"F1975":6.9,"F1980":6.9,"F1985":6.834,"F1990":6.635,"F1995":6.246,"F2000":5.845,"F2005":5.322,"L1950":36.324,"L1955":37.802,"L1960":39.36,"L1965":41.04,"L1970":42.821,"L1975":44.514,"L1980":45.826,"L1985":46.886,"L1990":47.472,"L1995":47.464,"L2000":46.608,"L2005":46.859},
{"Country":"Norway","Pop1955":3427409,"Pop1960":3581239,"Pop1965":3723153,"Pop1970":3877386,"Pop1975":4007313,"Pop1980":4085620,"Pop1985":4152419,"Pop1990":4242006,"Pop1995":4359101,"Pop2000":4492400,"Pop2005":4593041,"Group":"Europe & Central Asia","Cluster":1,"F1950":2.602,"F1955":2.837,"F1960":2.898,"F1965":2.719,"F1970":2.248,"F1975":1.81,"F1980":1.687,"F1985":1.8,"F1990":1.886,"F1995":1.853,"F2000":1.801,"F2005":1.848,"L1950":72.67,"L1955":73.44,"L1960":73.47,"L1965":74.08,"L1970":74.34,"L1975":75.37,"L1980":75.97,"L1985":75.89,"L1990":77.32,"L1995":78.32,"L2000":79.05,"L2005":80.196},
{"Country":"Pakistan","Pop1955":44434445,"Pop1960":50386898,"Pop1965":57494940,"Pop1970":65705964,"Pop1975":74711541,"Pop1980":85219117,"Pop1985":99060352,"Pop1990":114578478,"Pop1995":128690285,"Pop2000":146342958,"Pop2005":162419946,"Group":"South Asia","Cluster":0,"F1950":6.6,"F1955":6.6,"F1960":6.6,"F1965":6.6,"F1970":6.6,"F1975":6.6,"F1980":6.6,"F1985":6.66,"F1990":5.8,"F1995":4.9596,"F2000":3.9936,"F2005":3.5211,"L1950":43.436,"L1955":45.557,"L1960":47.67,"L1965":49.8,"L1970":51.929,"L1975":54.043,"L1980":56.158,"L1985":58.245,"L1990":60.838,"L1995":61.818,"L2000":63.61,"L2005":65.483},
{"Country":"Peru","Pop1955":8671500,"Pop1960":9931000,"Pop1965":11467300,"Pop1970":13192800,"Pop1975":15161199,"Pop1980":17295298,"Pop1985":19348926,"Pop1990":21511443,"Pop1995":23846388,"Pop2000":25979722,"Pop2005":27925628,"Group":"America","Cluster":3,"F1950":6.853,"F1955":6.853,"F1960":6.853,"F1965":6.56,"F1970":6,"F1975":5.378,"F1980":4.65,"F1985":4.1,"F1990":3.7,"F1995":3.0995,"F2000":2.7005,"F2005":2.5065,"L1950":43.902,"L1955":46.263,"L1960":49.096,"L1965":51.445,"L1970":55.448,"L1975":58.447,"L1980":61.406,"L1985":64.134,"L1990":66.458,"L1995":68.386,"L2000":69.906,"L2005":71.421},
{"Country":"Philippines","Pop1955":24553055,"Pop1960":28528939,"Pop1965":33267569,"Pop1970":38603696,"Pop1975":44336842,"Pop1980":50940182,"Pop1985":57288037,"Pop1990":64318120,"Pop1995":71717437,"Pop2000":79739825,"Pop2005":87857473,"Group":"East Asia & Pacific","Cluster":4,"F1950":7.29,"F1955":7.13,"F1960":6.85,"F1965":6.5,"F1970":6,"F1975":5.5,"F1980":4.95,"F1985":4.55,"F1990":4.143,"F1995":3.7248,"F2000":3.5436,"F2005":3.2327,"L1950":47.752,"L1955":51.334,"L1960":54.757,"L1965":56.393,"L1970":58.065,"L1975":60.06,"L1980":62.082,"L1985":64.151,"L1990":66.458,"L1995":68.564,"L2000":70.303,"L2005":71.688},
{"Country":"Poland","Pop1955":27220668,"Pop1960":29589842,"Pop1965":31262358,"Pop1970":32526000,"Pop1975":33969240,"Pop1980":35578016,"Pop1985":37225792,"Pop1990":38119408,"Pop1995":38600642,"Pop2000":38654164,"Pop2005":38557984,"Group":"Europe & Central Asia","Cluster":1,"F1950":3.62,"F1955":3.29,"F1960":2.65,"F1965":2.27,"F1970":2.25,"F1975":2.26,"F1980":2.33,"F1985":2.15,"F1990":1.89,"F1995":1.478,"F2000":1.251,"F2005":1.227,"L1950":61.31,"L1955":65.77,"L1960":67.64,"L1965":69.61,"L1970":70.85,"L1975":70.67,"L1980":71.32,"L1985":70.98,"L1990":70.99,"L1995":72.75,"L2000":74.67,"L2005":75.563},
{"Country":"Portugal","Pop1955":8692600,"Pop1960":9036700,"Pop1965":9128850,"Pop1970":9044200,"Pop1975":9411090,"Pop1980":9777800,"Pop1985":9897192,"Pop1990":9922689,"Pop1995":10065543,"Pop2000":10335597,"Pop2005":10566212,"Group":"Europe & Central Asia","Cluster":1,"F1950":3.039,"F1955":3.03,"F1960":3.074,"F1965":2.849,"F1970":2.748,"F1975":2.41,"F1980":1.982,"F1985":1.594,"F1990":1.516,"F1995":1.475,"F2000":1.454,"F2005":1.455,"L1950":59.82,"L1955":61.51,"L1960":64.39,"L1965":66.6,"L1970":69.26,"L1975":70.41,"L1980":72.77,"L1985":74.06,"L1990":74.86,"L1995":75.97,"L2000":77.29,"L2005":78.098},
{"Country":"Rwanda","Pop1955":2698272,"Pop1960":3031804,"Pop1965":3264640,"Pop1970":3769171,"Pop1975":4356863,"Pop1980":5138689,"Pop1985":6009833,"Pop1990":6923738,"Pop1995":5706501,"Pop2000":7507056,"Pop2005":8440820,"Group":"Sub-Saharan Africa","Cluster":2,"F1950":7.8,"F1955":8,"F1960":8.1,"F1965":8.2,"F1970":8.29,"F1975":8.492,"F1980":8.5,"F1985":8.25,"F1990":6.9,"F1995":6.0993,"F2000":6.01,"F2005":5.9169,"L1950":40,"L1955":41.5,"L1960":43,"L1965":44.1,"L1970":44.6,"L1975":45,"L1980":46.218,"L1985":44.02,"L1990":23.599,"L1995":36.087,"L2000":43.413,"L2005":46.242},
{"Country":"Saudi Arabia","Pop1955":4243218,"Pop1960":4718301,"Pop1965":5327432,"Pop1970":6109051,"Pop1975":7204820,"Pop1980":9999161,"Pop1985":13330067,"Pop1990":16060761,"Pop1995":19966998,"Pop2000":23153090,"Pop2005":26417599,"Group":"Middle East & North Africa","Cluster":5,"F1950":7.175,"F1955":7.175,"F1960":7.257,"F1965":7.257,"F1970":7.298,"F1975":7.278,"F1980":7.015,"F1985":6.217,"F1990":5.446,"F1995":4.621,"F2000":3.81,"F2005":3.352,"L1950":39.875,"L1955":42.868,"L1960":45.914,"L1965":49.901,"L1970":53.886,"L1975":58.69,"L1980":63.012,"L1985":66.295,"L1990":68.768,"L1995":70.533,"L2000":71.626,"L2005":72.777},
{"Country":"South Africa","Pop1955":15368551,"Pop1960":17416653,"Pop1965":19898242,"Pop1970":22739921,"Pop1975":25815144,"Pop1980":29251588,"Pop1985":34254092,"Pop1990":38391094,"Pop1995":41779149,"Pop2000":44066197,"Pop2005":44344136,"Group":"Sub-Saharan Africa","Cluster":2,"F1950":6.5,"F1955":6.5,"F1960":6.3,"F1965":5.7,"F1970":5.47,"F1975":5,"F1980":4.556,"F1985":3.85,"F1990":3.343,"F1995":2.954,"F2000":2.802,"F2005":2.637,"L1950":45.009,"L1955":47.985,"L1960":49.951,"L1965":51.927,"L1970":53.696,"L1975":55.527,"L1980":58.161,"L1985":60.834,"L1990":61.888,"L1995":60.236,"L2000":53.365,"L2005":49.339},
{"Country":"Spain","Pop1955":29318745,"Pop1960":30641187,"Pop1965":32084511,"Pop1970":33876479,"Pop1975":35563535,"Pop1980":37488360,"Pop1985":38534853,"Pop1990":39350769,"Pop1995":39749715,"Pop2000":40016081,"Pop2005":40341462,"Group":"Europe & Central Asia","Cluster":1,"F1950":2.57,"F1955":2.75,"F1960":2.89,"F1965":2.92,"F1970":2.86,"F1975":2.57,"F1980":1.89,"F1985":1.48,"F1990":1.27,"F1995":1.182,"F2000":1.287,"F2005":1.409,"L1950":64.94,"L1955":66.66,"L1960":69.69,"L1965":71.44,"L1970":73.06,"L1975":74.39,"L1980":76.3,"L1985":76.9,"L1990":77.57,"L1995":78.77,"L2000":79.78,"L2005":80.941},
{"Country":"Switzerland","Pop1955":4980000,"Pop1960":5362000,"Pop1965":5943000,"Pop1970":6267000,"Pop1975":6403500,"Pop1980":6385229,"Pop1985":6563770,"Pop1990":6836626,"Pop1995":7157106,"Pop2000":7266920,"Pop2005":7489370,"Group":"Europe & Central Asia","Cluster":1,"F1950":2.28,"F1955":2.34,"F1960":2.51,"F1965":2.27,"F1970":1.82,"F1975":1.53,"F1980":1.53,"F1985":1.53,"F1990":1.54,"F1995":1.47,"F2000":1.415,"F2005":1.42,"L1950":69.62,"L1955":70.56,"L1960":71.32,"L1965":72.77,"L1970":73.78,"L1975":75.39,"L1980":76.21,"L1985":77.41,"L1990":78.03,"L1995":79.37,"L2000":80.62,"L2005":81.701},
{"Country":"Turkey","Pop1955":24144571,"Pop1960":28217122,"Pop1965":31950718,"Pop1970":35758382,"Pop1975":40529798,"Pop1980":45120802,"Pop1985":50669003,"Pop1990":56084632,"Pop1995":61188984,"Pop2000":65666677,"Pop2005":69660559,"Group":"Europe & Central Asia","Cluster":1,"F1950":6.9,"F1955":6.6,"F1960":6.19,"F1965":5.7,"F1970":5.3,"F1975":4.715,"F1980":4.15,"F1985":3.276,"F1990":2.904,"F1995":2.574,"F2000":2.23,"F2005":2.143,"L1950":43.585,"L1955":48.079,"L1960":52.098,"L1965":54.336,"L1970":57.005,"L1975":59.507,"L1980":61.036,"L1985":63.108,"L1990":66.146,"L1995":68.835,"L2000":70.845,"L2005":71.777},
{"Country":"United Kingdom","Pop1955":50946000,"Pop1960":52372000,"Pop1965":54350000,"Pop1970":55632000,"Pop1975":56215000,"Pop1980":56314000,"Pop1985":56620240,"Pop1990":57493307,"Pop1995":58426014,"Pop2000":59522468,"Pop2005":60441457,"Group":"Europe & Central Asia","Cluster":1,"F1950":2.18,"F1955":2.49,"F1960":2.81,"F1965":2.52,"F1970":2.04,"F1975":1.72,"F1980":1.8,"F1985":1.81,"F1990":1.78,"F1995":1.7,"F2000":1.695,"F2005":1.815,"L1950":69.18,"L1955":70.42,"L1960":70.76,"L1965":71.36,"L1970":72.01,"L1975":72.76,"L1980":74.04,"L1985":75.007,"L1990":76.42,"L1995":77.218,"L2000":78.471,"L2005":79.425},
{"Country":"United States","Pop1955":165931000,"Pop1960":180671000,"Pop1965":194303000,"Pop1970":205052000,"Pop1975":215973000,"Pop1980":227726463,"Pop1985":238466283,"Pop1990":250131894,"Pop1995":266557091,"Pop2000":282338631,"Pop2005":295734134,"Group":"America","Cluster":3,"F1950":3.446,"F1955":3.706,"F1960":3.314,"F1965":2.545,"F1970":2.016,"F1975":1.788,"F1980":1.825,"F1985":1.924,"F1990":2.025,"F1995":1.994,"F2000":2.038,"F2005":2.054,"L1950":68.44,"L1955":69.49,"L1960":70.21,"L1965":70.76,"L1970":71.34,"L1975":73.38,"L1980":74.65,"L1985":75.02,"L1990":76.09,"L1995":76.81,"L2000":77.31,"L2005":78.242},
{"Country":"Venezuela","Pop1955":6170497,"Pop1960":7556483,"Pop1965":9067735,"Pop1970":10758017,"Pop1975":12674987,"Pop1980":14767890,"Pop1985":16997509,"Pop1990":19325222,"Pop1995":21555902,"Pop2000":23542649,"Pop2005":25375281,"Group":"America","Cluster":3,"F1950":6.4585,"F1955":6.4585,"F1960":6.657,"F1965":5.9045,"F1970":4.941,"F1975":4.4685,"F1980":3.957,"F1985":3.6485,"F1990":3.25,"F1995":2.9415,"F2000":2.723,"F2005":2.547,"L1950":55.088,"L1955":57.907,"L1960":60.77,"L1965":63.479,"L1970":65.712,"L1975":67.456,"L1980":68.557,"L1985":70.19,"L1990":71.15,"L1995":72.146,"L2000":72.766,"L2005":73.747},
];

var dataset = [];
for (var j = 0;j<data.length;j++){
    dataset[j] = [];
    dataset[j] = {"points":[],"label":data[j].Country};
    var pts = [];
    pts[0] = [data[j].F1955,data[j].L1955];
    pts[1] = [data[j].F1960, data[j].L1960];
    pts[2] = [data[j].F1965,data[j].L1965];
    pts[3] = [data[j].F1970, data[j].L1970];
    pts[4] = [data[j].F1975,data[j].L1975];
    pts[5] = [data[j].F1980, data[j].L1980];
    pts[6] = [data[j].F1985, data[j].L1985];
    pts[7] = [data[j].F1990, data[j].L1990];
    pts[8] = [data[j].F1995, data[j].L1995];
    pts[9] = [data[j].F2000, data[j].L2000];
    pts[10] = [data[j].F2005, data[j].L2005];
    dataset[j].points = pts;
}


var labels = ["1955","1960","1965","1970","1975","1980","1985","1990","1995","2000","2005"]; //Hard coded years for view labels
var xLabel = "fertility rate (children per woman)";
var yLabel = "life expectancy (years)";
var title = "Fertility Rate vs. Life Expectancy of Selected World Countries";

document.querySelector('#LibraPlayground').innerHTML = `
<div style="background:#c7c7c7;width:90px;height:100px;margin-top:20px;position:absolute;display:none;" id="hintPathFormDiv">
    <div style="color:#666;font-family:sans-serif;font-size:14px;padding:10px">Hint Path</div>
  <form id="hintPathForm" style="font-family:sans-serif;font-size:12px;color:#666;">
      <label><input type="radio" name="mode" value=0 checked>Timeline</label><br/>
      <label><input type="radio" name="mode" value=1>Flashlight</label>
      <label><input type="radio" name="mode" value=3>Combined</label>
  </form>
</div>

   <div id="scatter"></div>
`

/** This file creates and coordinates a scatterplot and a slider according to the provided dataset
 * */

//Add a main svg which all visualization elements will be appended to
d3.select("#scatter").append("svg").attr("id","mainSvg").on("click",function(){
    scatterplot.clearHintPath();
    scatterplot.clearPointLabels();
});
var screenWidth = 800;
var screenHeight = 500;
// window.onload = function (){
d3.select("#mainSvg").attr("width",screenWidth).attr("height",screenHeight);

d3.select("#hintPathFormDiv").style("margin-left",(screenWidth*0.6+90)+"px");
// }

d3.select("#hintPathForm").selectAll("input").on("change", function change() {
    scatterplot.hintPathType = this.value;
});

//Create a new scatterplot visualization
var scatterplot   = new Scatterplot(screenWidth*0.6, screenHeight*0.6,50);

scatterplot.init();
// setHintPathType(scatterplot,1);

//Define the click interaction of the hint labels to invoke fast switching among views
scatterplot.clickHintLabelFunction = function (event, d){
    event.stopPropagation(); //Prevents the event from propagating down to the SVG
    scatterplot.animatePoints(scatterplot.draggedPoint,scatterplot.currentView, d.id);
    changeView(scatterplot, d.id);
    slider.updateSlider(d.id);
};

scatterplot.render( dataset, labels,xLabel,yLabel,title); //Draw the scatterplot, dataset is an array created in a separate js file containing the json data,
                                        // and labels is an array representing the different views of the dataset

//Define the dragging interaction of the scatterplot points, which will continuously update the scatterplot
var dragPoint = d3.drag()
               .subject(function(_,d){ //Set the starting point of the drag interaction
                    return {x:d.nodes[scatterplot.currentView][0],y:d.nodes[scatterplot.currentView][1]};
               }).on("start", function(_,d){
                    scatterplot.clearHintPath();
                    scatterplot.draggedPoint = d.id;
                    scatterplot.previousDragAngle = 0; //To be safe, re-set this
                    scatterplot.selectPoint(d);
              }).on("drag", function(event, d){
                   if (scatterplot.hintPathType!=1){
                       slider.animateTick(scatterplot.interpValue,scatterplot.currentView,scatterplot.nextView);
                   }
                   scatterplot.updateDraggedPoint(d.id,event.x,event.y, d.nodes);
              }).on("end",function (_,d){ //In this event, mouse coordinates are undefined, need to use the saved
                                          //coordinates of the scatterplot object
                    scatterplot.snapToView(d.id,d.nodes);
                    slider.updateSlider(scatterplot.currentView);
              });

//Apply the dragging function to all points of the scatterplot, making them all draggable
scatterplot.svg.selectAll(".displayPoints").call(dragPoint);

//Create a new slider widget as an alternative for switching views of the scatterplot visualization
var sliderSpacing = scatterplot.width/labels.length;
var slider   = new Slider(35, screenHeight*0.8, labels, "","#666",sliderSpacing);
slider.init();
slider.render();
				  
//Define the dragging interaction of the slider which will update the view of the scatterplot
 slider.dragEvent = d3.drag()  
						.on("start", function(){                               
                            scatterplot.clearHintPath();
					     }) 
                      .on("drag", function(event){                               					  
							slider.updateDraggedSlider(event.x);                       
						    scatterplot.interpolatePoints(-1,slider.interpValue,slider.currentTick,slider.nextTick);
					  })
					  .on("end",function (){
					      slider.snapToTick();
                          changeView(scatterplot,slider.currentTick);
                          scatterplot.redrawView(slider.currentTick);
					  });	

//Apply the dragging event to the slider's movable tick
slider.widget.select("#slidingTick").call(slider.dragEvent);
				   