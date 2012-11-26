#pragma strict

// "constants"
var lo_index : int = 0;
var hi_index : int = 32;

private var INIT_STATE = 0;
private var SETUP_STATE = 1;
private var GAME_STATE = 2;
private var MENU_STATE = 3;
private var CREDITS_STATE = 3;
private var PLAYER_TYPE_FORKER = "forker";
private var PLAYER_TYPE_BRANCHER = "brancher";
private var PLAYER_TYPE_BOTH = "both";

// public
var init_number_of_bushes : int;
var z_placement : float;
var groundTexture1 : Texture2D;
var groundTexture2 : Texture2D;
var playerType = PLAYER_TYPE_BOTH;

// private
private var bushesPlaced : int;
private var gameState : int = INIT_STATE;
private var escapeMenuOn = false;
private var setupStep = 0;					// the curent step in the battle-setup process
private var gameStarted : boolean = false;

var BUTTON_W = 300;
var BUTTON_H = 200;
var BUTTONS_PER_ROW : int = 1;


/* Unity virtuals */
function Start ()
{
	CreateInitScene();
	SetState(SETUP_STATE);
}

function Update ()
{
	if(Input.GetKeyDown(UnityEngine.KeyCode.Escape))
	{
		ToggleEscapeMenu();
	}
}

function OnGUI()
{
	if(gameState == INIT_STATE)
	{
		DoInitGUI();
	}
	else if(gameState == SETUP_STATE)
	{
		DoSetupGUI();
	}
	else if(gameState == GAME_STATE)
	{
		DoGameboardGUI();
	}
	else if(gameState == MENU_STATE)
	{
		DoMenuGUI();
	}
}
/******************/

function GetCamControl()
{
	return GameObject.Find("Main Camera").GetComponent(CamControl);
}

function ToggleCamControl(val : boolean)
{
	GetCamControl().enabled = val;
}

function GetSize()
{
	return Vector2(hi_index, hi_index);
}

function ToggleEscapeMenu()
{
	if(MENU_STATE == gameState)
	{
		SetState(GAME_STATE);
	}
	else if(GAME_STATE == gameState)
	{
		SetState(MENU_STATE);
	}
}

function SetState(newGameState : int)
{
	var camOn = false;

	// Do whatever to clean up the gamestate
	
	gameState = newGameState;

	switch(newGameState)
	{
		case INIT_STATE:
			CreateInitScene();
			break;

		case SETUP_STATE:
			CreateSetupScene();
			break;
			
		case MENU_STATE:
			break;

		case GAME_STATE:
			camOn = true;
			CreateGameScene();
			break;
	}
	
	ToggleCamControl(camOn);
}

function DoSelectionGrid(selectionGridInt : int, selectionStrings : String[])
{
	return GUILayout.SelectionGrid(selectionGridInt, selectionStrings, BUTTONS_PER_ROW);
}

function DoInitGUI()
{
	GUI.backgroundColor = Color.black;
	GUI.color = Color.green;

	var selectionStrings : String[] = ["Start the Battle"];
	var selectionGridInt : int = 3;

	selectionGridInt = DoSelectionGrid(selectionGridInt, selectionStrings);
	switch(selectionGridInt)
	{
		case 0:
			SetState(SETUP_STATE);
			break;
		case 1:
			break;
	}
}

function DoSetupGUI()
{
	GUI.backgroundColor = Color.black;
	GUI.color = Color.green;

	GUILayout.BeginArea(Rect(Screen.width*0.25, Screen.height*0.2, Screen.width*0.5, Screen.height*0.5));

	switch(setupStep)
	{
		case 0:
			GUILayout.BeginHorizontal();
			GUILayout.FlexibleSpace();
			GUILayout.TextArea("Forkers: Offensive,\nBranchers: Defensive,\nBoth: Play with both");
			GUILayout.FlexibleSpace();
			GUILayout.EndHorizontal();

			var selectionStrings : String[] = ["Forkers", "Branchers", "Both"];
			var selectionGridInt : int = 99;
		
			selectionGridInt = DoSelectionGrid(selectionGridInt, selectionStrings);
			switch(selectionGridInt)
			{
				case 0:
					playerType = PLAYER_TYPE_FORKER;
					SetState(GAME_STATE);
					break;
				case 1:
					playerType = PLAYER_TYPE_BRANCHER;
					SetState(GAME_STATE);
					break;
				case 2:
					playerType = PLAYER_TYPE_BOTH;
					SetState(GAME_STATE);
					break;
			}
			break;
		default:
			break;
	}
	
	GUILayout.EndArea();
}

function DoGameboardGUI()
{
}

function DoMenuGUI()
{

	GUILayout.BeginArea(Rect(Screen.width*0.25, Screen.height*0.2, Screen.width*0.5, Screen.height*0.5));


	var selectionGridInt : int = 255;
	var selectionStrings : String[] = ["Return", "Quit"];

	// Show the Escape menu GUI
	selectionGridInt = DoSelectionGrid(selectionGridInt, selectionStrings);
	switch(selectionGridInt)
	{
		case 0:
			ToggleEscapeMenu();
			break;
		case 1:
			Application.LoadLevel("init_scene");
			break;
	}
	
	GUILayout.EndArea();
}


function CreateInitScene()
{
	gameState = INIT_STATE;

	// Nothing to do yet but show the UI, which is done in OnGUI
}

function CreateSetupScene()
{
	gameState = SETUP_STATE;

	// Nothing to do yet but show the UI, which is done in OnGUI
}

function CreateGameScene()
{
	gameState = GAME_STATE;
	
	if(!gameStarted)
	{
		// Setup the Gameboard itself
		CreateGameboard();
		gameStarted = true;
	}
}

function PositionValid(position : Vector2)
{
	if(0 > position.x || GetSize().x < position.x ||
	   0 > position.y || GetSize().y < position.y)
		return false;
	
	return true;
}

function GetCellScript(x,y)
{
	return GameObject.Find(String.Format("HexPlain/cell_{0}_{1}_", x, y)).GetComponent(CellScript);
}

function CreateBush(x : int, y : int)
{	
	var result : boolean = false;
	
	if(PositionValid(Vector2(x,y)))
	{
		result = GetCellScript(x,y).CreateBush(bushesPlaced);
		if(result)
		{
			bushesPlaced++;
		}
	}
	
	return result;
}

function CreateBase(x : int, y : int, name : String, player : boolean, baseType : String)
{
	var result : boolean = false;

	if(PositionValid(Vector2(x,y)))
	{
		result = GetCellScript(x,y).CreateBase(name, player, baseType);
	}
	
	return result;
}

function MoveTo(piece : GameObject, x : int, y : int)
{
	GameObject.Find(String.Format("HexPlain/cell_{0}_{1}_", x, y)).GetComponent(CellScript).MoveTo(piece);
}

function CreateGameboard()
{
	var tex : Texture2D = null;

	// This loop is O(n^2), but 32x32 iterations might not be too bad...
	for(var x=0; x < hi_index; x++)
	{
		for(var y=0; y < hi_index; y++)
		{
			// Determine a random texture from the two defined.
			if(1 == Random.Range(1,3))
			{
				tex = groundTexture2;
			}
			else
			{
				tex = groundTexture1;
			}
			
			// Set the texture
			gameObject.Find(String.Format("/HexPlain/cell_{0}_{1}_", x, y)).renderer.material.mainTexture = tex;
			
			// Place bushes
			if((bushesPlaced < init_number_of_bushes) && (2 == Random.Range(1,20)))
			{
				CreateBush(x, y);
			}
		}
	}
	
	var playerPos : Vector2 = Vector2(3,3);
	var opponentPos : Vector2 = Vector2(28,28);

	switch(playerType)
	{
		case PLAYER_TYPE_FORKER:
			//Create a base.
			CreateBase(playerPos.x, playerPos.y, "player_base", true, PLAYER_TYPE_FORKER);
			//Create a base.
			CreateBase(opponentPos.x, opponentPos.y, "opponent_base", false, PLAYER_TYPE_BRANCHER);
			break;
		case PLAYER_TYPE_BRANCHER:
			//Create a base.
			CreateBase(playerPos.x, playerPos.y, "player_base", true, PLAYER_TYPE_BRANCHER);
			//Create a base.
			CreateBase(opponentPos.x, opponentPos.y, "opponent_base", false, PLAYER_TYPE_FORKER);
			break;
		case PLAYER_TYPE_BOTH:
			//Create a base.
			CreateBase(playerPos.x, playerPos.y, "player_base", true, PLAYER_TYPE_BOTH);
			//Create a base.
			CreateBase(opponentPos.x, opponentPos.y, "opponent_base", false, PLAYER_TYPE_BOTH);
			break;
	}
	
	GetCamControl().SetPosition(playerPos);
}
