#pragma strict

private var INIT_MENU = 0;
private var CREDITS = 1;

private var initState = INIT_MENU;

var BUTTON_W = 300;
var BUTTON_H = 200;
var BUTTONS_PER_ROW : int = 1;


function Start ()
{
	CreateInitScene();
}

function Update () {

}

function OnGUI()
{
	switch(initState)
	{
		case INIT_MENU:
			DoInitGUI();
			break;
		case CREDITS:
			//TODO:
			break;
	}
}


function DoInitGUI()
{
	GUI.backgroundColor = Color.black;
	GUI.color = Color.green;

	var selectionStrings : String[] = ["Start a Battle", "Credits"];
	var selectionGridInt : int = 99;

	selectionGridInt = GUI.SelectionGrid(Rect((Screen.width/2 - (BUTTON_W/2)),
											  (Screen.height/2 - (((selectionStrings.Length/BUTTONS_PER_ROW)*BUTTON_H)/2)),
											  BUTTON_W, BUTTON_H),
											  selectionGridInt, selectionStrings, BUTTONS_PER_ROW);
	switch(selectionGridInt)
	{
		case 0:
			Debug.Log("Start a Battle");
			Application.LoadLevel("game_scene");
			break;
		case 1:
			Debug.Log("Credits");
			break;
		default:
			break;
	}
}

function CreateInitScene()
{
	initState = INIT_MENU;
	
	// Just an experiment	
	//Application.LoadLevel("init_scene");

	// Nothing to do yet but show the UI, which is done in OnGUI
	//TODO: Do something interesting here?
}