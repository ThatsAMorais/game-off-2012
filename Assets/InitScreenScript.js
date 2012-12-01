#pragma strict

private var INIT_MENU = 0;
private var CREDITS = 1;

private var initState = INIT_MENU;

var BUTTON_W = 300;
var BUTTON_H = 200;
var BUTTONS_PER_ROW : int = 1;
var TitleTextStyle : GUIStyle = new GUIStyle();

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
	var selectionStrings : String[] = ["Start a Battle", "Credits"];
	var selectionGridInt : int = 99;
	
	GUILayout.BeginArea(Rect(Screen.width*0.05, Screen.height*0.05, Screen.width*0.9, Screen.height*0.4));
	GUILayout.TextField("Forks - V - Branches", TitleTextStyle);
	GUILayout.EndArea();
	
	
	GUILayout.BeginArea(Rect(Screen.width*0.2, Screen.height*0.5, Screen.width*0.6, Screen.height*0.6));
	//GUI.backgroundColor = Color.black;
	//GUI.color = Color.green;
	selectionGridInt = GUILayout.SelectionGrid(selectionGridInt, selectionStrings, BUTTONS_PER_ROW);
	switch(selectionGridInt)
	{
		case 0:
			Application.LoadLevel("game_scene");
			break;
		case 1:
			break;
	}
	GUILayout.EndArea();
}

function CreateInitScene()
{
	initState = INIT_MENU;
	
	// Just an experiment	
	//Application.LoadLevel("init_scene");

	// Nothing to do yet but show the UI, which is done in OnGUI
	//TODO: Do something interesting here?
}