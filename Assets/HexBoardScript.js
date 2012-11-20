#pragma strict

// "constants"
var lo_index : int = 0;
var hi_index : int = 32;
private var INIT_STATE = 0;
private var GAME_STATE = 1;
private var CREDITS_STATE = 2; // Not a priority, just needed(wanted) a third state


// public
var base : Transform;
var branch_bush : Transform;
var forker : Transform;
var brancher : Transform;
var branch : Transform;
var fork : Transform;
var fortification : Transform;
var init_number_of_bushes : int;
var init_number_of_forkers : int;
var init_number_of_branchers : int;
var z_placement : float;
var dropped_z_placement : float;
var groundTexture1 : Texture2D;
var groundTexture2 : Texture2D;


// private
private var forkerCount : int;
private var brancherCount : int;
private var branchCount : int;
private var forkCount : int;
private var fortificationCount : int;
private var bushesPlaced : int;
private var gameState : int = INIT_STATE;
private var escapeMenuOn = false;


/* Unity virtuals */
function Start ()
{
	CreateInitScene();
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
		//GameObject.Find("Main Camera").GetComponent("Cam Control").enabled = false;
	}
	else
	{
		// Enable the camera script
		//GetComponent(CameraScript).enabled = true;
	}
}

function DoInitGUI()
{
	GUI.backgroundColor = Color.black;
	GUI.backgroundColor.a = 255;
	GUI.color = Color.green;

	var selectionStrings : String[] = ["Start a Battle", "Credits"];
	var selectionGridInt : int = 3;

	selectionGridInt = GUI.SelectionGrid(Rect(Screen.width/2, Screen.height/2, 100, 50), selectionGridInt, selectionStrings, 1);
	switch(selectionGridInt)
	{
		case 0:
			SetState(GAME_STATE);
			break;
		case 1:
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
		selectionGridInt = GUI.SelectionGrid(Rect (Screen.width/2, Screen.height/2, 100, 50), selectionGridInt, selectionStrings, 1);
		switch(selectionGridInt)
		{
			case 0:
				ToggleEscapeMenu();
				break;
			case 1:
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
	
	// Just an experiment	
	//Application.LoadLevel("init_scene");

	// Nothing to do yet but show the UI, which is done in OnGUI
	//TODO: Do something interesting here?
}


function CreateGameScene()
{
	gameState = GAME_STATE;
	
	// Just an experiment
	//Application.LoadLevel("game_scene");
	
	// Setup the Gameboard itself
	CreateGameboard();
}


function SetupPiece(piece : Transform, x, y, z : float, name : String, scale : Vector3)
{
	piece.parent = gameObject.Find(String.Format("HexPlain/_{0}_{1}_", x, y)).transform;
	piece.transform.position = gameObject.Find(String.Format("HexPlain/_{0}_{1}_", x, y)).transform.position;
	piece.transform.position.y = z;
	//piece.transform.localScale = scale;
	piece.name = name;
}

function CreateBush(x, y)
{
	var bushClone : Transform = Instantiate(branch_bush);
	SetupPiece(bushClone, x, y, z_placement, String.Format("branchbush_{0}", bushesPlaced), new Vector3(2, 2, 2));
	bushesPlaced += 1;
}

function CreateBase(x, y, color:Color, name : String, rotation : Vector3)
{
	var baseClone : Transform = Instantiate(base);
	SetupPiece(baseClone, x, y, z_placement, name, new Vector3(4, 30, 4));
	baseClone.GetChild(0).renderer.material.color = color;
	//baseClone.Rotate(rotation);
}

function CreateBranch(x, y)
{
	var branchClone : Transform = Instantiate(branch);
	SetupPiece(branchClone, x, y, dropped_z_placement, String.Format("branch_{0}", branchCount), new Vector3(2,2,2));
	//branchClone.transform.Rotate(new Vector3(90,0,0));
	branchCount++;
}

function CreateForker(x, y)
{
	var forkerClone : Transform = Instantiate(forker);
	var z = forkerClone.position.y; ///hacking it up
	SetupPiece(forkerClone, x, y, z, String.Format("forker_{0}", forkerCount), new Vector3(1,1,1));
	forkerCount++;
}

function CreateFork(x, y)
{
	var forkClone : Transform = Instantiate(fork);
	SetupPiece(forkClone, x, y, dropped_z_placement, String.Format("fork_{0}", forkCount), new Vector3(1,1,1));
	forkCount++;
}

function CreateBrancher(x, y)
{
	var brancherClone : Transform = Instantiate(brancher);
	SetupPiece(brancherClone, x, y, z_placement, String.Format("brancher_{0}", brancherCount), new Vector3(1,1,1));
	brancherCount++;
}


function CreateFortification(x, y)
{
	var fortificationClone : Transform = Instantiate(fortification);
	SetupPiece(fortificationClone, x, y, z_placement, String.Format("fortification_{0}", fortificationCount), new Vector3(1,1,1));
	fortificationCount++;
}


function SetState(newGameState : int)
{
	// Do whatever to clean up the gamestate
	// TODO: Might not be necessary if making better use of Unity scenes.
	CleanUpPreviousState();
	
	gameState = newGameState;

	switch(newGameState)
	{
		case GAME_STATE:
			CreateGameScene();
			break;
	}
}

function CleanUpPreviousState()
{
	
}


function CreateGameboard()
{
	var tex : Texture2D = null;

	// This loop is pretty grotesque, but 1024 iterations might not be too bad...
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

	//Create the base.
	CreateBase(3, 3, Color.red, "ForkerBase", new Vector3(0,-15,0));
	
	var piecePos : Vector2 = new Vector2(3,6);
	var incrs : int = 0;
	for(var f=0; f < init_number_of_forkers; f++)
	{
		CreateForker(piecePos.x, piecePos.y);
		CreateBranch(piecePos.x+1, piecePos.y);
		piecePos.y++;
		incrs++;
		
		if(4 == incrs)
		{
			piecePos.x += 2;
			piecePos.y -= 4;
		}
	}
	
	//Create the base.
	CreateBase(28, 28, Color.blue, "BrancherBase", new Vector3(0,15,0));
	
	piecePos = new Vector2(27, 27);
	for(var b=0; b < init_number_of_branchers; b++)
	{
		CreateBrancher(piecePos.x, piecePos.y);
		CreateBranch(piecePos.x-1, piecePos.y);
		piecePos.y--;
		incrs++;
		
		if(4 == incrs)
		{
			piecePos.x -= 2;
			piecePos.y += 4;
		}
	}	
}
