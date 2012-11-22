#pragma strict

var baseType : String = "default";
var player : boolean = false;
var forker : Transform;
var brancher : Transform;
var z_placement : float;
var forkerCount : int;
var brancherCount : int;
var number_of_forkers_alive = 0;
var number_of_branchers_alive = 0;
var unit_creation_waypoint : Vector2;

private var current_construction : String;
private var construction_in_progress : boolean = false;
private var construction_progress : int = 0;

var MAX_UNITS_PER_BASE = 15;
var CONSTRUCTION_TIME = 10;
var UNIT_DROP_X = 0;
var UNIT_DROP_Y = 0;

function Start ()
{
	InitializeBase();
}

function Update () {

	// TODO: Chimney-like particle effect
	
	// TODO: Enable or disable various animations
	
	if(construction_in_progress)
	{
		StepConstruction(Time.deltaTime);
	}
	
	if(player)
	{
		switch(baseType)
		{
			case "forker":
			case "brancher":
			case "both":
				// passively wait
				// update things
				break;
		}
	}
	else
	{
		// Opponent AI goes here
		
	}
}

function ConstructUnit(unit : String, x, y)
{
	switch(unit)
	{
		case "forker":
			CreateForker(x, y);
			break;
		case "brancher":
			CreateBrancher(x,y);
			break;
	}
}

function InitializeBase()
{
	// Clear variables
	// Set defaults
	var modifier : int = 2;
	var rotation : int = 0;
	
	// Hack
	if(15 > gameObject.transform.position.x)
	{
		modifier *= -1;
		rotation = -90;
	}
		
	UNIT_DROP_X = gameObject.transform.position.x + modifier;
	UNIT_DROP_Y = gameObject.transform.position.y + modifier;

	gameObject.transform.Rotate(0,0,rotation);
	
	//////*Test Code*///////////
	/*
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
	*/

	/////////////////////////////
}

function SetBaseType(type : String)
{
	// TODO: Validate the input (for now, trust and coupled code)
	baseType = type;
	
	switch(baseType)
	{
		case "forker":
			SetBaseColor(Color.red);
			break;
		case "brancher":
			SetBaseColor(Color.blue);
			break;
		case "both":
			SetBaseColor(Color.yellow);
			break;
	}
}

function SetPlayerType(isPlayer : boolean)
{
	player = isPlayer;
}

function SetBaseColor(color : Color)
{
	// TODO: Give access to the tower's primary color
	gameObject.transform.GetChild(0).renderer.material.color = color;
}

function cancelCurrentConstruction()
{
	// TODO: clears the current thing being created by the base 
	current_construction = "";
	construction_in_progress = false;
	construction_progress = 0;
}

function CreateUnit(unit : String)
{
	var spawnPoint : Vector2 = new Vector2(15,15);
	switch(unit)
	{
		case "forker":
			CreateForker(spawnPoint.x, spawnPoint.y);
		case "brancher":
			CreateBrancher(spawnPoint.x, spawnPoint.y);
	}
	
	var unitScript = GameObject.Find(name).GetComponent(UnitScript);
	unitScript.SetTeam(player);
	unitScript.SetHomeBase(gameObject.transform);
}

function CreateForker(x, y)
{
	var forkerClone : Transform = Instantiate(forker);
	var name : String = FormatUnitName("forker");
	GameObject.Find("HexPlain").GetComponent(HexBoardScript).SetupPiece(forkerClone, x, y, z_placement, name);	
	forkerCount++;
	number_of_forkers_alive++;
}

function CreateBrancher(x, y)
{
	var brancherClone : Transform = Instantiate(brancher);
	GameObject.Find("HexPlain").GetComponent(HexBoardScript).SetupPiece(brancherClone, x, y, z_placement, FormatUnitName("brancher"));
	brancherCount++;
	number_of_branchers_alive++;
}

function FormatUnitName(unit : String)
{
	return String.Format("{0}_{1}_{2}",
						unit,
		 				(unit == "forker" ? forkerCount : brancherCount),
		 				(player ? "p" : "o"));
}

function UnitDeath(unit : String)
{
	if(unit == "forker")
		number_of_forkers_alive = Mathf.Max(0, number_of_forkers_alive - 1);
	else if(unit == "brancher")
		number_of_branchers_alive = Mathf.Max(0, number_of_branchers_alive - 1);
}

function GetForkerCount()
{
	return forkerCount;
}

function GetBrancherCount()
{
	return brancherCount;
}

function StartConstruction(construction : String)
{
	current_construction = construction;
	construction_in_progress = true;
	construction_progress = 0;
}

function StepConstruction(deltaTime : float)
{
	construction_progress += deltaTime;
	
	if(construction_progress >= CONSTRUCTION_TIME)
	{
		ConstructUnit(current_construction, UNIT_DROP_X, UNIT_DROP_Y);
		
		current_construction = "";
		construction_in_progress = false;
		construction_progress = 0;
	}
}

// Just an opaque wrapper
function DoSelectedGUI(rect : Rect)
{
	GUILayout.BeginArea(rect);
	
	DoBaseGUIPanel();
	
	GUILayout.EndArea();
}

function DoBaseGUIPanel()
{
	/******Layout*******
	 ------------------		// -Text
	 ------------------
	 +++++++ | ////////		// +Buttons
	 +++++++ | ////////		// /Current-Construction
	*******************/
	
	GUILayout.BeginVertical();
	
	/*- Stat Fields -*/
	GUI.enabled = false;
	GUILayout.TextField(String.Format("Number of Branchers Alive: {0}/{1}", number_of_branchers_alive, GetBrancherCount()));
	GUILayout.TextField(String.Format("Number of Forkers Alive: {0}/{1}", number_of_forkers_alive, GetForkerCount()));
	GUI.enabled = true;
	/*-\Stat Fields\-*/
	
	//GUILayout.FlexibleSpace();
	
	GUILayout.BeginHorizontal();
	
	/*- Vertical Buttons -*/
	GUILayout.BeginVertical();
	// Disable the buttons if a construction is currently in progress.
	GUI.enabled = !(construction_in_progress);
	// Disable the buttons if the max number of units has been reached.
	GUI.enabled = !(MAX_UNITS_PER_BASE == (number_of_branchers_alive + number_of_forkers_alive));
	
	if(("forker" == baseType) || ("both" == baseType))
	{		
		if(GUILayout.Button(String.Format("Forker ({0})", number_of_forkers_alive)))
		{
			StartConstruction("forker");
		}
	}
	if(("brancher" == baseType) || ("both" == baseType))
	{	
		if(GUILayout.Button(String.Format("Brancher ({0})", number_of_forkers_alive)))
		{
			StartConstruction("brancher");
		}
	}
	GUI.enabled = true;
	GUILayout.EndVertical();
	/*-\Vertical Buttons\-*/
	
	// Current Construction
	if(construction_in_progress)
	{
		GUI.enabled = false;
		GUILayout.TextField(String.Format("Currently constructing: {0} ({1})", current_construction));
		GUI.enabled = true;
	}
	else if(MAX_UNITS_PER_BASE == (number_of_branchers_alive + number_of_forkers_alive))
	{	
		GUI.enabled = false;
		GUILayout.TextField(String.Format("Reached the max number of units: {0}", MAX_UNITS_PER_BASE));
		GUI.enabled = true;
	}

	GUILayout.EndHorizontal();
	
	GUILayout.EndVertical();
}