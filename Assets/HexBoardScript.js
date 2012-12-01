#pragma strict

// public
var init_number_of_bushes : int;
var z_placement : float;
var groundTexture1 : Texture2D;
var groundTexture2 : Texture2D;
var playerType = PLAYER_TYPE_BOTH;
var guiBG_default : Texture;

var playerPos : Vector2 = Vector2(28,28);
var opponentPos : Vector2 = Vector2(3,3);

var MAX_UNITS_PER_TURN : int = 3;
var MAX_UNITS_PER_BASE = 21;

// "constants"
private var lo_index : int = 0;
private var hi_index : int = 32;
private var INIT_STATE = 0;
private var SETUP_STATE = 1;
private var GAME_STATE = 2;
private var MENU_STATE = 3;
private var GAME_OVER_STATE = 4;
private var CREDITS_STATE = 3;
private var PLAYER_TYPE_FORKER = "forker";
private var PLAYER_TYPE_BRANCHER = "brancher";
private var PLAYER_TYPE_BOTH = "both";

// private
private var bushesPlaced : int;
private var gameState : int = INIT_STATE;
private var escapeMenuOn = false;
private var setupStep = 0;					// the curent step in the battle-setup process
private var gameStarted : boolean = false;
private var player_turn : boolean = true;

private var AI_ACTION_DELAY : float = 3.0;
private var NUMBER_OF_ACTION_POINTS : int = 3;
private var MAX_ROUNDS : int = 4;
private var current_round : int = MAX_ROUNDS;
private var opponent_ai_action_delay : float = AI_ACTION_DELAY;
private var opponent_action_points : int = NUMBER_OF_ACTION_POINTS;
private var player_action_points : int = NUMBER_OF_ACTION_POINTS;

var BUTTON_W = 300;
var BUTTON_H = 200;
var BUTTONS_PER_ROW : int = 1;

function Start ()
{
	CreateInitScene();
	SetState(SETUP_STATE);
}

function Update ()
{
	if(Input.GetKeyDown(UnityEngine.KeyCode.Escape))
	{
		if(gameState == GAME_STATE)
		{
			ToggleEscapeMenu();
		}
		else if(gameState == SETUP_STATE)
		{
			Application.LoadLevel("init_scene");
		}
	}
	
	if(!player_turn)
	{
		DoOpponentTurn(Time.deltaTime);
	}
	
	if(0 == current_round)
	{
		SetState(GAME_OVER_STATE);
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
	else if(gameState == GAME_OVER_STATE)
	{
		DoGameOverGUI();
	}
}

function EndTurn()
{	
	// Toggle the turn
	player_turn = (!player_turn);
	
	if(player_turn)
	{
		current_round--;
		resetTurn("player_base");
		ToggleCamControl(true);
	}
	else
	{
		opponent_ai_action_delay = 0;
		resetTurn("opponent_base");
		ToggleCamControl(false);
	}
}

function resetTurn(base : String)
{
	GameObject.Find(base).GetComponent(BaseScript).ResetTurn();
}

function DoOpponentTurn(deltaTime : float)
{
	// TODO:
	// Opponent's agenda
	//  - build up x number of units or f=x*0.5 and b=x*0.5 for forkers and branchers
	// if(branchers)
	//  - distribute the units defensively around the base radially outward
	// if(forkers)
	//  - travel diagonally to locate the player's base and fortifications
	
	var base : GameObject = GameObject.Find("opponent_base");
	var baseScript : BaseScript = base.GetComponent(BaseScript);
	var baseType : String = baseScript.GetBaseType();
	var forkersAlive : int = baseScript.GetForkerAliveCount();
	var branchersAlive : int = baseScript.GetBrancherAliveCount();
	var unitTotal : int;
	
	var target : Vector2 = new Vector2(Random.Range(8,24),Random.Range(8,24));
	
	if(baseScript.GetActionPoints())
	{
		if(4.0 <= opponent_ai_action_delay)
		{
			if(MAX_UNITS_PER_BASE > (forkersAlive + branchersAlive))
			{
				if(baseType == "both")
				{
					if(forkersAlive <= branchersAlive)
					{
						baseScript.CreateUnit("forker");
					}
					else
					{
						baseScript.CreateUnit("brancher");
					}
					
					unitTotal = forkersAlive + branchersAlive;
				}
				else if(baseType == "forker")
				{
					baseScript.CreateUnit("forker");
					unitTotal = forkersAlive;
				}
				else if(baseType == "brancher")
				{
					baseScript.CreateUnit("brancher");
					unitTotal = branchersAlive;
				}
			}
			
			// Redirect a random unit to a random cell
			baseScript.DirectUnit(Random.Range(0,unitTotal), new Vector2(Random.Range(8,24),Random.Range(8,24)));
			
			opponent_ai_action_delay = 0;
		}
		
		opponent_ai_action_delay += deltaTime;
	}
	else
	{
		EndTurn();
	}
	
	
}

function GetCamControl() : CamControl
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

	GUILayout.BeginArea(Rect(Screen.width*0.25, Screen.height*0.25, Screen.width*0.5, Screen.height*0.5));

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
	// Top 20% of the screen
	GUILayout.BeginArea(Rect(0, 0, Screen.width, Screen.height*0.2));
	GUILayout.BeginHorizontal();

	// Left
	
	GUILayout.BeginVertical();
	GUILayout.TextArea("Controls:\n -Zoom : MouseWheel\n -Shift+Hold : Enables Cam Mvmt\n -Left-Click : Selects Units and Bases\n -Right-Click : Trigger");
	GUILayout.EndVertical();
	
	GUILayout.FlexibleSpace();
	
	// Middle
	GUILayout.BeginVertical();
	GUILayout.TextField(String.Format("Turns Left: {0}", current_round));
	GUILayout.TextField((player_turn ? "Player" : "Opponent"));
	GUI.enabled = player_turn ? true : false;
	if(GUILayout.Button("End Turn"))
	{
		EndTurn();
	}
	GUI.enabled = true;
	GUILayout.EndVertical();

	// Right
	/*
	GUILayout.BeginVertical();
	GUILayout.Space(Screen.width*40);
	GUILayout.EndVertical();
	*/
	GUILayout.FlexibleSpace();
	
	GUILayout.EndHorizontal();
	GUILayout.EndArea();
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

function DoGameOverGUI()
{
	var rect : Rect = Rect(Screen.width*0.3, Screen.height*0.3, Screen.width*0.3, Screen.height*0.3);
	
	GUILayout.BeginArea(rect);
	GUILayout.Box(guiBG_default);
	GUILayout.EndArea();
	
	GUILayout.BeginArea(rect);
	GUILayout.TextField("You are a winner!  (Based primarily on your participation)");
	if(GUILayout.Button("Quit"))
	{
		Application.LoadLevel("init_scene");
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
			if((bushesPlaced < init_number_of_bushes) && (2 == Random.Range(1,16)))
			{
				CreateBush(x, y);
			}
		}
	}
}
