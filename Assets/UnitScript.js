#pragma strict

import System.Collections.Generic;

// Public
var fork : GameObject;
var fortification : GameObject;
var item_placement = 0;
var team_player : boolean = false;
var home_base : GameObject = null;
var unitType : String;
var ACTION_POINTS_PER_TURN : int = 3;
var MAX_UNIT_HEALTH = 64;

private var HEADING_STRAIGHT = 0;
private var HEADING_LEFT = 60;
private var HEADING_BACK_LEFT = 120;
private var HEADING_RIGHT = -60;
private var HEADING_BACK_RIGHT = -120;
private var HEADING_BACK = 180;

private var BRANCH : String = "branch";
private var BASE : String = "base";
private var BUSH : String = "bush";
private var FORK : String = "fork";
private var FORTIFICATION : String = "fortification";
private var FORKER : String = "forker";
private var BRANCHER : String = "brancher";

var heading : int = HEADING_STRAIGHT;

// Stats
private var health : int = MAX_UNIT_HEALTH;
private var forkCount : int = 0;
private var fortificationCount : int = 0;

// States and Status
private var MAX_BRANCHES : int = 4;
private var newly_created : boolean = true;
private var branches : List.<GameObject> = List.<GameObject>();
private var branch_pos : List.<float> = List.<float>();
private var world_position : Vector2 = Vector2(-1,-1);
private var in_hand : GameObject = null;

private var selected : boolean = false;
private var action_points = ACTION_POINTS_PER_TURN;
private var target_position : Vector2;
private var path : List.<Vector2> = new List.<Vector2>();
private var has_target : boolean = false;
private var previousPathHighlight : Vector2;
private var time_since_last_move : int = 1.0;

private var FORK_DAMAGE = 0.3;

// Animate variables
private var newly_created_rotation = 0;

function ResetTurn()
{
	action_points = ACTION_POINTS_PER_TURN;
	time_since_last_move = 1.0;
}

function OnDestroy()
{
	DropItems();
	//TODO: Do a "killed" animation	
}

function Start ()
{
	// Determine the unit-type
	unitType = gameObject.name.Contains(FORKER) ? FORKER : BRANCHER;
	gameObject.transform.Rotate(gameObject.name.Contains(FORKER) ? 0 : 90, 0, 0);
	
	branch_pos.Add(0.7);
	branch_pos.Add(0.6);
	branch_pos.Add(0.5);
	branch_pos.Add(0.4);
	
	// Disabling this for now.
	newly_created = false;
}

function Update ()
{
	// Don't run this logic until the piece is setup
	if(GetPosition().x == -1 || GetPosition().y == -1)
	{
		return;
	}
	
	if(health <= 0)
	{
		// Game Over, man!
		Kill();
	}

	// Do the unit created animation
	if(newly_created)
	{
		DoNewUnitAnimation();
	}
	
	if(selected && !GetCellScript(world_position.x, world_position.y).IsSelected())
	{
		selected = false;
	}
	
	if(selected)
	{
		//TODO
	}
	
	if(has_target && 0 < GetActionPoints())
	{
		//if(time_since_last_move >= 2.0)
		if(true)
		{
			// Get the neighbor in the direction we are facing (which is the direction of our target)		
			var nextCellPos : Vector2 = GetNeighbor(GetHeading());
		
			Debug.Log(String.Format("{0}:has_target : target({1})", DebugLogLeadString(), GetCellScript(nextCellPos.x,nextCellPos.y).GetInhabitant()));
			
			if(GetCellScript(nextCellPos.x, nextCellPos.y).SlotInhabited())
			{
				// Something is there

				if(nextCellPos == GetTarget())
				{
					var inhabitant : GameObject = GetCellScript(nextCellPos.x,nextCellPos.y).GetInhabitant();
					var neighborName : String = inhabitant.name;
					
					// Opponent Base
					if(neighborName.Contains(team_player ? "opponent_base" : "player_base"))
					{
						// This is the opponent's base
						if(null != in_hand && in_hand.name.Contains(FORK))
						{
							// Fork
							Fork(inhabitant);
						}
						else
						{
							has_target = false;
						}
					}
					// Friendly Base
					if(neighborName.Contains(team_player ? "player_base" : "opponent_base"))
					{
						if(0 < branches.Count)
						{
							GiveBranches(inhabitant, branches.Count);
						}
						has_target = false;
					}
					// Unit
					else if(neighborName.Contains(FORKER) || neighborName.Contains(BRANCHER))
					{
						// Check if this unit is a friend or foe
						
						// Friend
						if(IsPlayer() == inhabitant.GetComponent(UnitScript).IsPlayer())
						{
							MoveTowardHeading();
							has_target = false;
						}
						// Foe
						else
						{
							if(in_hand.name.Contains(FORK))
							{
								// Fork
								Fork(inhabitant);
							}
							else
							{
								// Push
								Push(inhabitant, GetHeading());
							}
						}
					}
					// Bush
					else if(neighborName.Contains(BUSH))
					{
						PickBranch(inhabitant);
					}
					// Branch
					else if((neighborName.Contains(BRANCH)) ||
							(neighborName.Contains(FORK)) ||
							(neighborName.Contains(FORTIFICATION)))
					{
						Pickup(inhabitant);
					}
				}
				else
				{
					// Go around
					MoveTowardHeading();
				}
			}
			else
			{			
				MoveTowardHeading();
			}
						
			// If we have walked into the target cell, then stop
			if(has_target)
			{
				if(GetPosition() == GetTarget())
				{
					has_target = false;
				} 
				else
				{
					// Look toward the target
					SetHeadingTowardPosition(GetTarget());
					time_since_last_move = 1.0;
				}
			}
			
			time_since_last_move = 0;
		}
		else
		{
			time_since_last_move += Time.deltaTime;
		}
	}
}

function DebugLogLeadString() : String
{
	return String.Format("UnitScript({0})", gameObject.name);
}

function TakeDamage(damage : float)
{
	if(in_hand.name.Contains(FORTIFICATION))
	{
		in_hand.GetComponent(PickupScript).Damage(damage);
	}
	else
	{
		health -= damage;
	}
	
	Debug.Log(String.Format("{0}:TakeDamage() damage{1}", DebugLogLeadString(), damage));
}

function DropItems()
{
	if(null != in_hand)
	{
		TossItem(in_hand);
		in_hand = null;
	}
	else
	{
		DropBranch(MAX_BRANCHES);
	}
	
	Debug.Log(String.Format("{0}:DropItems()", DebugLogLeadString()));
}

function DropItem()
{
	if(null != in_hand)
	{
		TossItem(in_hand);
		in_hand = null;
	}
	else
	{	
		DropBranch(1);
	}
	
	Debug.Log(String.Format("{0}:DropItem()", DebugLogLeadString()));
}

function DropBranch(numBranches : int)
{
	for(var b=0; 0 < branches.Count && b < numBranches; b++)
	{
		TossItem(branches[0]);
		branches.RemoveAt(0);
	}
	
	Debug.Log(String.Format("{0}:DropBranch()", DebugLogLeadString()));
}

function GiveBranches(piece : GameObject, numBranches : int)
{
	var branches_taken : int = 0;
	
	if(piece.name.Contains(BASE))
	{
		branches_taken = piece.GetComponent(BaseScript).TakeBranches(branches.GetRange(0, numBranches));
	}
	else if(piece.name.Contains(FORKER) || piece.name.Contains(BRANCHER))
	{
		branches_taken = piece.GetComponent(UnitScript).TakeBranches(branches.GetRange(0, numBranches));
	}
	
	// Remove the corresponding branches
	for(; 0 < branches_taken; branches_taken--)
	{
		branches.RemoveAt(0);
	}
	
	Debug.Log(String.Format("{0}:GiveBranches()", DebugLogLeadString()));
}

function TakeBranches(branchesGiven : List.<GameObject>)
{
	var branches_taken : int = 0;
	
	while(MAX_BRANCHES < branches.Count || branches_taken == branchesGiven.Count)
	{
		branches.Add(branchesGiven[branches_taken]);
		branches_taken++;
	}
	
	Debug.Log(String.Format("{0}:TakeBranches()", DebugLogLeadString()));
	
	return branches_taken;
}

function PickBranch(piece : GameObject)
{
	var branch : GameObject;
	// Cannot take a branch if carrying a weapon
	if(4 > branches.Count && null == in_hand)
	{
		if(piece.name.Contains("bush"))
		{
			branch = piece.GetComponent(BushScript).GetBranch();
			if(branch)
				branches.Add(branch);
		}
		else if(piece.name.Contains("base"))
		{
			branch = piece.GetComponent(BaseScript).GetBranch();
			if(branch)
				branches.Add(branch);
		}
		
		if(branch)
		{
			branch.transform.localPosition = new Vector3(0, -1, branch_pos[0]);
		}
	}
	
	Debug.Log(String.Format("{0}:PickBranch()", DebugLogLeadString()));
}

function Fork(piece : GameObject)
{
	if(piece.name.Contains(BASE))
	{
		piece.GetComponent(BaseScript).Forked();
	}
	else if(piece.name.Contains(FORKER) || piece.name.Contains(BRANCHER))
	{
		piece.GetComponent(UnitScript).Forked();
	}
	
	// Get the cell of the targeted Cell
	UseActionPoints(1);
	
	Debug.Log(String.Format("{0}:Fork()", DebugLogLeadString()));
}

function Forked()
{
	// Take Damage
	TakeDamage(FORK_DAMAGE);
	
	Debug.Log(String.Format("{0}:Forked()", DebugLogLeadString()));
}

function Push(unit : GameObject, heading : int)
{
	var push_success : boolean = false;
	var nextCellPos : Vector2 = GetNeighbor(heading);

	// Attempt to push the unit
	push_success = unit.GetComponent(UnitScript).Pushed(heading);
	if(push_success)
	{
		// If successful, move to the location that was pushed
		MoveTo(gameObject, nextCellPos.x, nextCellPos.y);
		UseActionPoints(1);
	}
	
	Debug.Log(String.Format("{0}:Push()", DebugLogLeadString()));
}

function Pushed(heading : int) : boolean
{
	var nextCellPos : Vector2 = GetNeighbor(heading);
	Debug.Log(String.Format("{0}:Pushed()", DebugLogLeadString()));
	return MoveTo(gameObject, nextCellPos.x, nextCellPos.y);
}

function Pickup(pickup : GameObject)
{
	// 	If a Fork or Fortification -> Toss current Pickup, Pickup target
	if((0 == branches.Count) && (pickup.name.Contains(FORK) || pickup.name.Contains(FORTIFICATION)))
	{
		GraspItem(pickup);
	}
	
	// If picking up a Branch, add to the pile
	else if((null == in_hand) && (pickup.name.Contains(BRANCH)))
	{
		branches.Add(pickup);
	}
	
	Debug.Log(String.Format("{0}:Pickup()", DebugLogLeadString()));
}

function MoveTowardHeading()
{
	var currentHeading : int = HEADING_STRAIGHT;
	var slotInhabited = true;
	var nextCellPos : Vector2;
	
	// Break when the first uninhabited slot is found
	while(slotInhabited && has_target)
	{	
		nextCellPos = GetNeighbor(currentHeading);
		
		if(!PositionValid(nextCellPos))
		{
			continue;
		}
		
		slotInhabited = GetCellScript(nextCellPos.x, nextCellPos.y).SlotInhabited();
		
		if(slotInhabited)
		{			
			switch(currentHeading)
			{
				case HEADING_STRAIGHT:
					currentHeading = HEADING_RIGHT;
					break;
				case HEADING_RIGHT:
					currentHeading = HEADING_LEFT;
					break;
				case HEADING_LEFT:
					currentHeading = HEADING_BACK_RIGHT;
					break;
				case HEADING_BACK_RIGHT:
					currentHeading = HEADING_BACK_LEFT;
					break;
				case HEADING_BACK_LEFT:
					currentHeading = HEADING_BACK;
					break;
				case HEADING_BACK:
					// Stuck on all sides
					has_target = false;
					break;
			}
		}
	}
	
	if(has_target)
	{
		if(false == MoveSelf(nextCellPos.x, nextCellPos.y))
		{
			Debug.Log("Failed to move to nextCellPos");
		}
		else
		{
			UseActionPoints(1);
		}
	}
	
	Debug.Log(String.Format("{0}:MoveTowardHeading()", DebugLogLeadString()));
}

function MoveSelf(x : int, y : int) : boolean
{
	return MoveTo(gameObject, x, y);
}

function MoveTo(object : GameObject, x : int, y : int) : boolean
{
	return GetCellScript(x, y).MoveTo(object);
}

/*
function FindPathToPosition(targetPos : Vector2)
{
	// Clear the existing path
	path.Clear();
	
	// Recursively determine the path
	FindDirectionOfTarget(GetPosition(), targetPos);
}*/

function diff(a : int, b : int) : int
{
	return (a >= b) ? (a - b) : (b - a);
}

function GetActionPoints() : int
{
	return action_points;
}

function UseActionPoints(ap_used : int)
{	
	action_points -= ap_used;
}

function OnMouseEnter()
{
    //startcolor = renderer.material.color;
    //renderer.material.color = Color.yellow;
}
function OnMouseExit()
{
    //renderer.material.color = startcolor;
}

function GetTarget() : Vector2
{
	return target_position;
}

function SetTarget(x : int, y : int)
{
	// TODO: Upon setting this target, a path will have been generated between
	//		this unit's current position and the target.  By enabling has_target
	//		the Update() will churn through the positions until the user has
	//		either reached their target or run out of action-points for the turn

	target_position = new Vector2(x,y);
	Debug.Log(String.Format("SetTarget {0}",target_position));
	SetHeadingTowardPosition(target_position);
	has_target = true;
}

function MouseoverTarget(position : Vector2)
{
	// TODO: Determine the path between this cell's (x,y) and (position)
	// TODO: Retain a list of the path from this cell's (x,y) to (position)
	if(null != previousPathHighlight)
	{
		GameObject.Find(String.Format("HexPlain/cell_{0}_{1}_",
									  previousPathHighlight.x,
									  previousPathHighlight.y)).GetComponent(CellScript).SetPathHighlight(false, "valid");
	}
	
	GameObject.Find(String.Format("HexPlain/cell_{0}_{1}_", position.x, position.y)).GetComponent(CellScript).SetPathHighlight(true, "valid");
	
	// TODO: This will be in the path-list
	previousPathHighlight = position;
}

function SetPosition(x : int, y : int)
{
	Debug.Log(String.Format("SetPosition ({0},{1})", x, y));
	Debug.Log(String.Format("Setting position of {0}, to {1}.", gameObject.name, new Vector2(x,y)));
	
	world_position = Vector2(x,y);
	gameObject.transform.localPosition.z += 0.3;
	//gameObject.transform.localRotation = Quaternion.identity;
	RotateToHeading();
}

function GetPosition() : Vector2
{
	return world_position;
}

function GetUnitType() : String
{
	return unitType;
}

function GetHealth() : int
{
	return health;
}

function DoNewUnitAnimation()
{
	var angle = 90.0*Time.deltaTime;
	newly_created_rotation += angle;
	
	// Don't let the rotation exceed 360 degrees
	if(360 < newly_created_rotation)
	{
		angle -= newly_created_rotation - 360;
	}
	
	gameObject.transform.Rotate(0.0, angle, 0.0);
	
	if(newly_created_rotation >= 360)
	{
		newly_created = false;
	}
}

function CreateFork() : GameObject
{
	var forkClone : GameObject = Instantiate(fork);
	forkCount++;
	return forkClone;
}

function CreateFortification() : GameObject
{
	var fortificationClone : GameObject = Instantiate(fortification);
	fortificationCount++;
	return fortificationClone;
}

function FormatUnitName(item : String) : String
{
	return String.Format("{0}_{1}",
						item,
		 				(item == FORK ? GetForkCount() : GetFortificationCount()));
}

function RotateToHeading()
{
	gameObject.transform.localRotation = Quaternion.identity;
	gameObject.transform.Rotate(new Vector3(0,heading,0));
}

function SetHeading(newHeading : int)
{
	heading = newHeading;
	RotateToHeading();
}

function SetHeadingTowardPosition(position : Vector2) : int
{
	var startPoint : Vector2 = GetPosition();
	var diffX : float = diff(startPoint.x, position.x);
	var diffY : float = diff(startPoint.y, position.y);
	var slope : float = diffY / diffX;
	var direction : int = 0;
	
	if(0.5 >= slope)
	{
		// Move along x
		if(position.x > startPoint.x)
		{
			direction = HEADING_STRAIGHT;
		}
		else
		{
			direction = HEADING_BACK;
		}
	}
	else
	{
		if(position.x > startPoint.x)
		{
			if(position.y > startPoint.y)
			{
				direction = HEADING_RIGHT;
			}
			else
			{
				direction = HEADING_LEFT;
			}
		}
		else
		{
			if(position.y > startPoint.y)
			{
				direction = HEADING_BACK_RIGHT;
			}
			else
			{
				direction = HEADING_BACK_LEFT;
			}
		}
	}
	
	SetHeading(direction);
	
	return direction;
}

function GetHeading() : int
{
	return heading;
}

function GetCellScript(x : int, y : int) : CellScript
{
	var pos : Vector2 = new Vector2((x == -1) ? world_position.x : x, (y == -1) ? world_position.y : y);
	var cell : GameObject = GameObject.Find(String.Format("HexPlain/cell_{0}_{1}_", pos.x, pos.y));
	
	if(null != cell)
	{
		return cell.GetComponent(CellScript);
	}
	else
	{
		//Debug.Log(String.Format("Error: {0}", Vector2(x,y)));
	}
	
	return null;
}

function GetBehindNeighbor()
{
}

function GetNeighbor(direction : int) : Vector2
{
	var neighborDir = GetHeading(); // default to HEADING_STRAIGHT
	/*
	neighborDir = ((neighborDir-180)%360) + (neighborDir < 180 ? 180 : -180);
	neighborDir = (neighborDir == -180) ? 180 : neighborDir;
	*/
	
	switch(direction)
	{
		case HEADING_BACK:
			neighborDir *= -1;
			if(-180 == neighborDir)
				neighborDir = 0;
			else if(0 == neighborDir)
				neighborDir = 180;
			break;
			
		case HEADING_LEFT:
			neighborDir += 60;
			if(180 < neighborDir)
				neighborDir = -120;
			break;
			
		case HEADING_RIGHT:
			neighborDir -= 60;
			if(-120 > neighborDir)
				neighborDir = 180;
			break;
			
		case HEADING_BACK_LEFT:
			neighborDir += 120;
			if(300 == neighborDir)
				neighborDir = -60;
			if(240 == neighborDir)
				neighborDir = -120;
			break;
			
		case HEADING_BACK_RIGHT:
			neighborDir -= 120;
			if(-240 == neighborDir)
				neighborDir = 120;
			if(-180 == neighborDir)
				neighborDir = 180;
			break;
	}
	
	
	var neighborPos : Vector2 = GetCellScript(GetPosition().x, GetPosition().y).GetNeighbor(neighborDir);
	return neighborPos;
}

function GetMapSize() : Vector2
{
	return GameObject.Find("HexPlain").GetComponent(HexBoardScript).GetSize();
}

function PositionValid(position : Vector2) : boolean
{
	if(0 > position.x || GetMapSize().x < position.x ||
	   0 > position.y || GetMapSize().y < position.y)
		return false;
	
	return true;
}

function TossItem(item : GameObject) : boolean
{
	var result : boolean = false;
	var current_heading : int = HEADING_BACK;
	var neighbor = GetNeighbor(current_heading);

	while(false == MoveTo(item, neighbor.x, neighbor.y))
	{
		current_heading += HEADING_RIGHT;
		
		if((-1 * HEADING_BACK) <= current_heading)
		{
			break;
		}
		
		neighbor = GetNeighbor(current_heading);
	}
	
	return result;
}

function GraspItem(item : GameObject)
{
	if(null != in_hand)
	{
		TossItem(in_hand);
		in_hand = null;
	}
	
	item.transform.parent = gameObject.transform;
	if(item.name.Contains(FORK))
	{
		item.transform.localPosition = Vector3(-1,1,0);
		item.transform.localRotation = Quaternion.identity;
		item.transform.Rotate(Vector3(0,180,90));
		item.transform.localScale = Vector3(0.2,0.2,0.2);
	}
	else if(item.name.Contains(FORTIFICATION))
	{
		item.transform.localPosition = Vector3(1,0,0);
		//item.transform.localScale = Vector3(,0.3,0.2);
	}
	
	item.GetComponent(PickupScript).SetPosition(GetPosition().x, GetPosition().y);
}

function CreateItem()
{
	var name : String = FormatUnitName(unitType == FORKER ? FORK : FORTIFICATION);
	var item : GameObject;
	
	switch(unitType)
	{
		case FORKER:
			item = CreateFork();
			break;
		case BRANCHER:
			item = CreateFortification();
			break;
	}
	
	// Clear the used resources
	branches.Clear();
	
	item.name = name;
	
	GraspItem(item);
}

function SetHomeBase(homeBase : GameObject)
{
	home_base = homeBase;
}

function SetTeam(teamPlayer : boolean)
{
	team_player = teamPlayer;
}

function IsPlayer() : boolean
{
	return team_player;
}


function GetForkCount() : int
{
	return forkCount;
}

function GetFortificationCount() : int
{
	return fortificationCount;
}

function Kill()
{
	if(GetCellScript(world_position.x, world_position.y).GetComponent(CellScript).DestroyInhabitant())
	{
		home_base.GetComponent(BaseScript).UnitDeath(gameObject.name);
	}
}

function DoSelectedGUI(rect : Rect, guiBG : Texture)
{
	GUILayout.BeginArea(rect);
	GUILayout.Box(guiBG);
	GUILayout.EndArea();

	GUILayout.BeginArea(rect);
	GUILayout.BeginVertical();

	DoStatsGUI();
	
	if(MAX_BRANCHES <= branches.Count)
	{
		if(GUILayout.Button(String.Format("Create {0}", GetUnitType() == FORKER ? "Fork" : "Fortification")))
		{
			CreateItem();
		}
	}
	else
	{
		GUI.enabled = false;
		if(GUILayout.Button(String.Format("{0}/{1} Branches needed to make {2}",
										  branches.Count,
										  MAX_BRANCHES,
										  GetUnitType() == FORKER ? "Fork" : "Fortification"))){}
		GUI.enabled = true;
	}
	
	GUI.enabled = ((null != in_hand) || (0 < branches.Count));
	if(GUILayout.Button(String.Format("Drop {0}",
									  ((null != in_hand) ? (in_hand.name.Contains(FORK) ? "Fork" : "Fortification") :
									  					   (0 < branches.Count ? "Branch" : "")))))
	{
		DropItem();
	}
	GUI.enabled = true;
	
	GUILayout.FlexibleSpace();
	
	if(GUILayout.Button("Kill Unit"))
	{
		Kill();
	}

	GUILayout.EndVertical();
	GUILayout.EndArea();
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

function DoStatsGUI()
{
	var isPlayer : boolean = IsPlayer();
	
	GUILayout.TextField(String.Format("Unit : {0} ({1})", GetUnitType(), isPlayer ? "Ally" : "Enemy"));
	GUILayout.TextField(String.Format("Health: {0}", (GetHealth()/MAX_UNIT_HEALTH)*100));
	GUILayout.TextField(String.Format("Branches: {0}", branches.Count));
	GUILayout.TextField(String.Format("Action Points: {0}", GetActionPoints()));
	GUILayout.TextField(String.Format("Number of {0}s made : {1}",
									 GetUnitType() == FORKER ? FORK : FORTIFICATION,
									 GetUnitType() == FORKER ? GetForkCount() : GetFortificationCount()));
}

function Selected(selected : boolean) : boolean
{
	// TODO: Do a Selected animation
	
	// TODO: React to being selected in some way
	selected = true;
		
	return true;
}

function FindPathTo(x : int, y : int)
{
	// Recursively highlight 
}