#pragma strict

import System.Collections.Generic;

private var HEADING_STRAIGHT = 0;
private var HEADING_LEFT = 60;
private var HEADING_BACK_LEFT = 120;
private var HEADING_RIGHT = -60;
private var HEADING_BACK_RIGHT = -120;
private var HEADING_BACK = 180;

var MAX_UNITS_PER_TURN : int = 3;
var MAX_UNITS_PER_BASE = 15;
var CONSTRUCTION_TIME : float = 2;
var MAX_BASE_HEALTH = 1024;

var baseType : String;
var playerBaseTexture : Material;
var opponentBaseTexture : Material;
var player : boolean = false;
var forker : GameObject;
var brancher : GameObject;
var z_placement : float;
var forkerCount : int;
var brancherCount : int;
var number_of_forkers_alive = 0;
var number_of_branchers_alive = 0;
var unit_creation_waypoint : Vector2;

private var health : int = MAX_BASE_HEALTH;
private var current_construction : String;
private var construction_in_progress : boolean = false;
private var construction_progress : float = 0;
private var world_position : Vector2 = Vector2(1,1);
private var current_heading : int = HEADING_STRAIGHT;

private var target_position : Vector2 = new Vector2(28,27);
private var previousPathHighlight : Vector2;
private var selected : boolean = false;
private var units : List.<GameObject> = new List.<GameObject>();

private var MAX_BRANCHES : int = 4;
private var FORK_DAMAGE = 0.3;
private var branches : List.<GameObject> = new List.<GameObject>();

private var units_made_this_turn : int = 0;

function ResetTurn()
{
	units_made_this_turn = 0;
		
	for(var u=0; u < units.Count; u++)
	{
		units[u].GetComponent(UnitScript).ResetTurn();
	}
}

function OnDestroy()
{
	//TODO: Do a "killed" animation
}

function Start ()
{
	// There are some limitations to this function wrt transform
	InitializeBase();
}

function Update () {

	if(0 < health)
	{
		// TODO: Chimney-like particle effect
		
		// TODO: Enable or disable various animations
		
		if(construction_in_progress)
		{
			StepConstruction(Time.deltaTime);
		}
		
		if(selected && !GetCellScript(world_position.x, world_position.y).IsSelected())
		{
			selected = false;
		}
		
		if(selected)
		{//TODO
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
			DoOpponentAI(Time.deltaTime);
		}
	}
}

function DoOpponentAI(deltaTime : float)
{
	//TODO:
}

function DoSelected(deltaTime : float)
{
	//TODO: Glow the Cell with the way-point
}

function RotateToHeading()
{
	gameObject.transform.localRotation = Quaternion.identity;
	gameObject.transform.Rotate(new Vector3(0,0,GetHeading()));
}

function SetHeading(newHeading : int)
{
	current_heading = newHeading;
	RotateToHeading();
}

function GetHeading() : int
{
	return current_heading;
}

function InitializeBase()
{
	// Clear variables
}

function SetPosition(x : int, y : int)
{
	var heading : int = HEADING_BACK_RIGHT;

	world_position = Vector2(x,y);
	
	if(15 < world_position.x)
	{
		heading = HEADING_LEFT;
	}

	SetHeading(heading);

	unit_creation_waypoint = GetCellScript(world_position.x, world_position.y).GetNeighbor(heading);
	Debug.Log(String.Format("Setting position of {0}, so setting way-point and target to {1}", gameObject.name, unit_creation_waypoint));
	
	SetTarget(unit_creation_waypoint.x, unit_creation_waypoint.y);
}

function GetPosition() : Vector2
{
	return world_position;
}

function SetTarget(x : int, y : int)
{
	target_position = Vector2(x,y);
}

function GetTarget() : Vector2
{
	return target_position;
}

function Selected(selected : boolean) : boolean
{
	// TODO: Do a Selected animation
	
	// TODO: React to being selected in some way
	
	selected = true;
	
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

function GetForkerAliveCount() : int
{
	return number_of_forkers_alive;
}

function GetBrancherCount() : int
{
	return brancherCount;
}

function GetBrancherAliveCount() : int
{
	return number_of_branchers_alive;
}

function GetHealth() : int
{
	return health;
}

function GetActionPoints() : int
{
	return MAX_UNITS_PER_TURN - units_made_this_turn;
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

	if(player)
	{
		gameObject.renderer.material = playerBaseTexture;
	}
	else
	{
		gameObject.renderer.material = opponentBaseTexture;
	}
	
	gameObject.transform.GetChild(0).renderer.material.color = color;
}

function GetCellScript(x : int, y : int) : CellScript
{
	return GameObject.Find(String.Format("HexPlain/cell_{0}_{1}_", x, y)).GetComponent(CellScript);
}


function TakeBranches(branchesGiven : List.<GameObject>)
{
	var branches_taken : int = 0;
	
	while(MAX_BRANCHES < branches.Count || branches_taken == branchesGiven.Count)
	{
		branches.Add(branchesGiven[branches_taken]);
		branches_taken++;
	}
	
	return branches_taken;
}

function GetBranch() : GameObject
{
	var branch : GameObject;
	
	if(0 < branches.Count)
	{
		branch = branches[0];
		branches.RemoveAt(0);
	}
	
	return branch;
}

function TakeDamage(damage : float)
{
	health -= damage;
}

function Forked()
{
	// Take Damage
	TakeDamage(FORK_DAMAGE);
}

function DirectUnit(index : int, position : Vector2)
{
	if(index > 0 && index < units.Count)
	{
		units[index].GetComponent(UnitScript).SetTarget(position.x, position.y);
	}
	else
	{
		Debug.Log(String.Format("BaseScript:DirectUnit() : Bad Index{0}, position{1}", index, position));
	}
}

function MoveTo(piece : GameObject, x : int, y : int) : boolean
{
	return GetCellScript(x,y).MoveTo(piece);
}

function PlaceUnit(unit : GameObject) : boolean
{
	var result : boolean = true;
	var position : Vector2 = GetPosition();
	var placementPos : Vector2 = GetCellScript(position.x, position.y).GetNeighbor(GetHeading());
	
	Debug.Log(String.Format("PlaceUnit unit{0} position{1}", unit, placementPos));
	
	unit.GetComponent(UnitScript).MoveSelf(placementPos.x, placementPos.y);

	return result;
}

function FormatUnitName(unit : String) : String
{
	return String.Format("{0}_{1}_{2}",
						unit,
		 				(unit == "forker" ? GetForkerCount() : GetBrancherCount()),
		 				(IsPlayer() ? "p" : "o"));
}

function AddUnit(unit : GameObject)
{
	units.Add(unit);
}

function RemoveUnit(unit : GameObject)
{
	units.Remove(unit);
}

function CreateUnit(unit : String)
{
	var name : String = FormatUnitName(unit);
	var newUnit : GameObject;
	var unitScript : UnitScript;
	
	if(MAX_UNITS_PER_TURN != units_made_this_turn)
	{
		switch(unit)
		{
			case "forker":
				newUnit = Instantiate(forker).gameObject;
				forkerCount++;
				number_of_forkers_alive++;
				break;
			case "brancher":
				newUnit = Instantiate(brancher).gameObject;
				brancherCount++;
				number_of_branchers_alive++;
				break;
		}
		
		// Must do first
		newUnit.name = name;
	
		if(PlaceUnit(newUnit))
		{
			
			unitScript = newUnit.GetComponent(UnitScript);
			unitScript.SetTeam(IsPlayer());
			unitScript.SetHomeBase(gameObject);
			unitScript.SetTarget(GetTarget().x, GetTarget().y);
			
			AddUnit(newUnit);
		}
		
		units_made_this_turn++;
	}
}

function UnitDeath(unitName : String)
{
	if(unitName.Contains("forker"))
	{
		number_of_forkers_alive = Mathf.Max(0, number_of_forkers_alive - 1);
	}
	else if(unitName.Contains("brancher"))
	{
		number_of_branchers_alive = Mathf.Max(0, number_of_branchers_alive - 1);
	}
	
	RemoveUnit(GameObject.Find(unitName));
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
	construction_progress = CONSTRUCTION_TIME; // DISABLING this
	
	if(construction_progress >= CONSTRUCTION_TIME)
	{
		construction_progress = 0;
		construction_in_progress = false;
		
		CreateUnit(current_construction);
		
		ClearCurrentConstruction();
	}
}

function DoMouseoverGUI(rect : Rect, guiBG : Texture)
{
	GUILayout.BeginArea(rect);
	GUILayout.Box(guiBG);
	GUILayout.EndArea();

	GUILayout.BeginArea(rect);
	GUILayout.BeginVertical();

	DoStatsGUI();

	GUILayout.EndVertical();
	GUILayout.EndArea();
}


// Just an opaque wrapper
function DoSelectedGUI(rect : Rect, guiBG : Texture)
{
	GUILayout.BeginArea(rect);
	GUILayout.Box(guiBG);
	GUILayout.EndArea();

	GUILayout.BeginArea(rect);
	
	DoBaseGUIPanel();
	
	GUILayout.EndArea();
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

function DoStatsGUI()
{
	var bType = ("both" == GetBaseType() ? "forker" : GetBaseType());
	
	GUILayout.TextField(String.Format("Health: {0}", (GetHealth()/MAX_BASE_HEALTH)*100));
	GUILayout.TextField(String.Format("Action Points: {0}", GetActionPoints()));
	
	for(var i = ("both" == GetBaseType() ? 2 : 1); i > 0; i--)
	{
		GUILayout.TextField(String.Format("Number of {0}s Alive: {1}/{2}",
										  bType,
										  bType == "forker" ? number_of_forkers_alive : number_of_branchers_alive,
										  bType == "forker" ? GetForkerCount() : GetBrancherCount()));
			
		bType = ("forker" == bType ? "brancher" : "forker"); // Swap type for "both"-bases
	}
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

function MouseoverTarget(position : Vector2)
{
	GameObject.Find(String.Format("HexPlain/cell_{0}_{1}_",
								  previousPathHighlight.x,
								  previousPathHighlight.y)).GetComponent(CellScript).SetPathHighlight(false, "valid");
	
	GameObject.Find(String.Format("HexPlain/cell_{0}_{1}_", position.x, position.y)).GetComponent(CellScript).SetPathHighlight(true, "valid");
	
	previousPathHighlight = position;
}