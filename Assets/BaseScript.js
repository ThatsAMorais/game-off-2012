#pragma strict

var baseType : String;
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
private var construction_progress : float = 0;
private var world_position : Vector2 = Vector2(-1,-1);

var MAX_UNITS_PER_BASE = 15;
var CONSTRUCTION_TIME : float = 2;
var UNIT_DROP_X : float = 0;
var UNIT_DROP_Y : float = 0;

var target_position : Vector2;

function Start ()
{
	// There are some limitations to this function wrt transform
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
		switch(GetBaseType())
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


function InitializeBase()
{
	// Clear variables
	
	// Set defaults
	var rotation : int = 0;
	
	// Hack
	if(15 > gameObject.transform.position.x)
	{
		rotation = -90;
	}

	gameObject.transform.Rotate(0,0,rotation);
}

function SetPosition(x : int, y : int)
{
	world_position = new Vector2(x,y);
	target_position = new Vector2(x,y);
}

function GetPosition() : Vector2
{
	return world_position;
}

function SetTarget(x : int, y : int)
{
	target_position = new Vector2(x,y);
}

function Selected(selected : boolean) : boolean
{
	// TODO: Do a Selected animation
	
	// TODO: React to being selected in some way
		
	return true;
}

function SetBaseType(type : String)
{
	baseType = type;
	
	switch(GetBaseType())
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

function GetBaseType() : String
{
	return baseType;
}

function GetForkerCount() : int
{
	return forkerCount;
}

function GetBrancherCount() : int
{
	return brancherCount;
}

function SetPlayerType(isPlayer : boolean)
{
	player = isPlayer;
}
function IsPlayer() : boolean
{
	return player;
}

function SetBaseColor(color : Color)
{
	// TODO: Give access to the tower's primary color
	gameObject.transform.GetChild(0).renderer.material.color = color;
}

function FormatUnitName(unit : String) : String
{
	return String.Format("{0}_{1}_{2}",
						unit,
		 				(unit == "forker" ? GetForkerCount() : GetBrancherCount()),
		 				(IsPlayer() ? "p" : "o"));
}

function CreateUnit(unit : String)
{
	var name : String = FormatUnitName(unit);
	var modifier : int = 1;
	var newUnit : Transform;
	
	if(15 > world_position.y)
	{
		modifier *= -1;
	}
	
	UNIT_DROP_X  = world_position.x + modifier;
	UNIT_DROP_Y  = world_position.y - modifier;

	switch(unit)
	{
		case "forker":
			newUnit = CreateForker(UNIT_DROP_X, UNIT_DROP_Y, name);
			break;
		case "brancher":
			newUnit = CreateBrancher(UNIT_DROP_X, UNIT_DROP_Y, name);
			break;
	}
	
	var unitScript : UnitScript = newUnit.GetComponent(UnitScript);
	unitScript.SetTeam(player);
	unitScript.SetHomeBase(gameObject.transform);
}

/*
function SetupPiece(piece : Transform, x : int, y : int, z : float, name : String)
{
	GameObject.Find("HexPlain").GetComponent(HexBoardScript).SetupPiece(piece, x, y, z, name);
}
*/

function MoveTo(piece : Transform, x : int, y : int)
{
	GameObject.Find(String.Format("HexPlain/_{0}_{1}_", x, y)).GetComponent(CellScript).MoveTo(piece);
}

function CreateForker(x : int, y : int, name : String) : Transform
{
	var forkerClone : Transform = Instantiate(forker);
	forkerClone.name = name;
	
	/*SetupPiece(forkerClone, x, y, z_placement, name);*/
	MoveTo(forkerClone, x, y);
	
	forkerCount++;
	number_of_forkers_alive++;
	
	return forkerClone;
}

function CreateBrancher(x : int, y : int, name : String) : Transform
{
	var brancherClone : Transform = Instantiate(brancher);
	brancherClone.name = name;
	
	/*SetupPiece(brancherClone, x, y, z_placement, name);*/
	MoveTo(brancherClone, x, y);
	
	brancherCount++;
	number_of_branchers_alive++;
	
	return brancherClone;
}

function UnitDeath(unit : String)
{
	switch(unit)
	{
		case "forker":
			number_of_forkers_alive = Mathf.Max(0, number_of_forkers_alive - 1);
			break;
		case "brancher":
			number_of_branchers_alive = Mathf.Max(0, number_of_branchers_alive - 1);
			break;
	}
}

function StartConstruction(construction : String)
{
	current_construction = construction;
	construction_in_progress = true;
	construction_progress = 0;
}

function ClearCurrentConstruction()
{
	// TODO: clears the current thing being created by the base 
	current_construction = "";
	construction_in_progress = false;
	construction_progress = 0;
}

function StepConstruction(deltaTime : float)
{
	construction_progress += deltaTime;
	
	if(construction_progress >= CONSTRUCTION_TIME)
	{
		construction_progress = 0;
		construction_in_progress = false;
		
		CreateUnit(current_construction);
		
		ClearCurrentConstruction();
	}
}

// Just an opaque wrapper
function DoSelectedGUI(rect : Rect)
{
	GUILayout.BeginArea(rect);
	
	DoBaseGUIPanel();
	
	GUILayout.EndArea();
}

function DoStatsGUI()
{
	var bType = ("both" == GetBaseType() ? "forker" : GetBaseType());
	for(var i = ("both" == GetBaseType() ? 2 : 1); i > 0; i--)
	{
		GUILayout.TextField(String.Format("Number of {0}s Alive: {1}/{2}",
										  bType,
										  bType == "forker" ? number_of_forkers_alive : number_of_branchers_alive,
										  bType == "forker" ? GetForkerCount() : GetBrancherCount()));
			
		bType = ("forker" == bType ? "brancher" : "forker"); // Swap type for "both"-bases
	}
}

function DoBaseGUIPanel()
{
	/******Layout*******
	 ------------------		// - Text
	 ------------------
	 ##################		// # Flexible-space
	 +++++++ | ////////		// + Buttons
	 +++++++ | ////////		// / Current-Construction
	*******************/
	
	GUILayout.BeginVertical();

	GUILayout.TextField(String.Format("{0} Base ({1})", (GetBaseType() == "both" ? "Combo" : GetBaseType() == "forker" ? "Forker" : "Brancher"),
														 (IsPlayer() ? "Yours" : "Opponent's")));
	
	DoStatsGUI();
	
	GUILayout.FlexibleSpace();
	
	if(IsPlayer())
	{
		DoPlayerGUI();
	}
	else
	{
		DoOpponentGUI();
	}
	
	GUILayout.EndVertical();
}

function DoPlayerGUI()
{	
	GUILayout.BeginHorizontal();
		
		// Current Construction
	if(construction_in_progress)
	{
		GUILayout.BeginVertical();	
		GUILayout.TextField(String.Format("Constructing: {0} {1:0}%",
							current_construction,
							100 * (construction_progress/CONSTRUCTION_TIME)));
		if(GUILayout.Button("Cancel Construction"))
		{
			ClearCurrentConstruction();
		}
		GUILayout.EndVertical();
	}
	else if(MAX_UNITS_PER_BASE == (number_of_branchers_alive + number_of_forkers_alive))
	{	
		GUILayout.TextField(String.Format("Reached the max number of units: {0}", MAX_UNITS_PER_BASE));
	}
	else
	{
		GUILayout.BeginHorizontal();
		// Disable the buttons if a construction is currently in progress OR Disable the buttons if the max number of units has been reached.
		GUI.enabled = !(construction_in_progress) && !(MAX_UNITS_PER_BASE == (number_of_branchers_alive + number_of_forkers_alive));
		if(("both" == GetBaseType()) || ("forker" == GetBaseType()))
		{
			if(GUILayout.Button(String.Format("Forker ({0})", number_of_forkers_alive)))
			{
				StartConstruction("forker");
			}
		}
		if(("both" == GetBaseType()) || ("brancher" == GetBaseType()))
		{
			if(GUILayout.Button(String.Format("Brancher ({0})", number_of_branchers_alive)))
			{
				StartConstruction("brancher");
			}
		}
		GUI.enabled = true;
		GUILayout.EndHorizontal();
	}

	GUILayout.EndHorizontal();
}

function DoOpponentGUI()
{
	// Not sure what information to show about an opponent yet.
}
