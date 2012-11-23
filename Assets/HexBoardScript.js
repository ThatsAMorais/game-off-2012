#pragma strict

// "constants"
var lo_index : int = 0;
var hi_index : int = 32;

private var INIT_STATE = 0;
private var SETUP_STATE = 1;
private var GAME_STATE = 2;
private var CREDITS_STATE = 3;
private var PLAYER_TYPE_FORKER = "forker";
private var PLAYER_TYPE_BRANCHER = "brancher";
private var PLAYER_TYPE_BOTH = "both";

// public
var base : Transform;
var branch_bush : Transform;
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

var BUTTON_W = 300;
var BUTTON_H = 200;
var BUTTONS_PER_ROW : int = 1;


/* Unity virtuals */
function Start ()
{
	CreateInitScene();
	gameState = SETUP_STATE;
}

function Update ()
{
	if(Input.GetKeyUp(UnityEngine.KeyCode.Escape))
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
}
/******************/

function ToggleEscapeMenu()
{
	if(escapeMenuOn)
		escapeMenuOn = false;
	else
		escapeMenuOn = true;
	
	if(escapeMenuOn)
	{
		// Disable the camera script
		Camera.mainCamera.GetComponent(CamControl).enabled = false;
	}
	else
	{
		// Enable the camera script
		Camera.mainCamera.GetComponent(CamControl).enabled = true;
	}
}



function SetState(newGameState : int)
{
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

		case GAME_STATE:
			CreateGameScene();
			break;
	}
}

function DoSelectionGrid(selectionGridInt : int, selectionStrings : String[])
{
	return GUI.SelectionGrid(Rect((Screen.width/2 - (BUTTON_W/2)),
								  (Screen.height/2 - (((selectionStrings.Length/BUTTONS_PER_ROW)*BUTTON_H)/2)),
								  BUTTON_W, BUTTON_H),
							 selectionGridInt, selectionStrings, BUTTONS_PER_ROW);
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
	
	switch(setupStep)
	{
		case 0:
			GUI.TextArea(Rect(Screen.width/2-75, Screen.height/2-50, 150, 100), "Forkers: Offensive, Branchers: Defensive, Both: Play with both");

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
}

function DoGameboardGUI()
{
	if(escapeMenuOn)
	{
		var selectionGridInt : int = 255;
		var selectionStrings : String[] = ["Return", "Quit"];

		// Show the Escape menu GUI
		selectionGridInt = GUI.SelectionGrid(Rect (Screen.width/2, Screen.height/2, 1, 1), selectionGridInt, selectionStrings, 1);
		switch(selectionGridInt)
		{
			case 0:
				ToggleEscapeMenu();
				break;
			case 1:
				Application.LoadLevel("init_scene");
				break;
		}
	}
	else
	{
		// Show the Gameboard panels and selections
	}
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
	
	// Setup the Gameboard itself
	CreateGameboard();
}

function SetupPiece(piece : Transform, x : int, y : int, z : float, name : String)
{
	if(0 > x || 0 > y)
	{
		Debug.Log(String.Format("Bad Position: ({0},{1})", x, y));
	}
	else
	{
		piece.name = name;
		var columnTrans = gameObject.Find(String.Format("HexPlain/_{0}_{1}_", x, y));
		piece.parent = gameObject.Find(String.Format("HexPlain/_{0}_{1}_", x, y)).transform;
		piece.transform.localPosition = new Vector3(0,0, piece.transform.localPosition.z);
	}
}

function CreateBush(x : int, y : int)
{
	var name : String = String.Format("branchbush_{0}", bushesPlaced);
	var bushClone : Transform = Instantiate(branch_bush);
	
	SetupPiece(bushClone, x, y, 3, name);
	
	GameObject.Find(name).GetComponent(BushScript).SetPosition(x,y);
	bushesPlaced++;
}

function CreateBase(x : int, y : int, name : String, player : boolean, baseType : String)
{
	var baseClone : Transform = Instantiate(base);
	SetupPiece(baseClone, x, y, z_placement, name);
	baseClone.localPosition.x -= 0.25;
	baseClone.localPosition.y -= 0.25;
	
	var baseScript : BaseScript = GameObject.Find(name).GetComponent(BaseScript);
	baseScript.SetBaseType(baseType);
	baseScript.SetPlayerType(player);
	baseScript.SetPosition(x,y);
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
			gameObject.Find(String.Format("/HexPlain/_{0}_{1}_", x, y)).renderer.material.mainTexture = tex;
			
			// Place bushes
			if((bushesPlaced < init_number_of_bushes) && (2 == Random.Range(1,20)))
			{
				CreateBush(x, y);
			}
		}
	}

	switch(playerType)
	{
		case PLAYER_TYPE_FORKER:
			//Create a base.
			CreateBase(3, 3, "PlayerBase", true, PLAYER_TYPE_FORKER);
			//Create a base.
			CreateBase(28, 28, "OpponentBase", false, PLAYER_TYPE_BRANCHER);
			break;
		case PLAYER_TYPE_BRANCHER:
			//Create a base.
			CreateBase(3, 3, "PlayerBase", true, PLAYER_TYPE_BRANCHER);
			//Create a base.
			CreateBase(28, 28, "OpponentBase", false, PLAYER_TYPE_FORKER);
			break;
		case PLAYER_TYPE_BOTH:
			//Create a base.
			CreateBase(3, 3, "PlayerBase", true, PLAYER_TYPE_BOTH);
			//Create a base.
			CreateBase(28, 28, "OpponentBase", false, PLAYER_TYPE_BOTH);
			break;
	}	
}
