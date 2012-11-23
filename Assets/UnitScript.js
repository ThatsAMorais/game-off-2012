#pragma strict

private var HEADING_STRAIGHT = 0;
private var HEADING_LEFT = 60;
private var HEADING_BACK_LEFT = 120;
private var HEADING_RIGHT = -60;
private var HEADING_BACK_RIGHT = -120;
private var HEADING_BACK = 180;

// Public
var fork : Transform;
var fortification : Transform;
var item_placement = 0;
var team_player : boolean = false;
var home_base : Transform = null;
var unitType : String;
var ACTION_POINTS_PER_TURN : int = 3;
var dead : boolean = false;
var heading : int = HEADING_STRAIGHT;

// Stats
private var forkCount : int = 0;
private var fortificationCount : int = 0;

// States and Status
private var newly_created : boolean = true;
private var branches_held : int = 0;
private var world_position : Vector2;
private var in_hand : Transform = null;

private var action_points = ACTION_POINTS_PER_TURN;
private var target_position : Vector2;

// Animate variables
private var newly_created_rotation = 0;

// MouseOver //
private var startcolor : Color;


function Start ()
{
	// Determine the unit-type
	unitType = gameObject.name.Contains("forker") ? "forker" : "brancher";
}

function Update ()
{
	// Do the unit created animation
	if(newly_created)
	{
		DoNewUnitAnimation();
	}
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

function SetTarget(x : int, y : int)
{
	target_position = new Vector2(x,y);
}

function SetPosition(x : int, y : int)
{
	world_position = new Vector2(x,y);
}

function GetPosition()
{
	return world_position;
}

function GetUnitType()
{
	return unitType;
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

function SetupPiece(piece : Transform, x : int, y : int, z : float, name : String)
{
	GameObject.Find("HexPlain").GetComponent(HexBoardScript).SetupPiece(piece, x, y, z, name);
}

function CreateFork(name : String)
{
	var forkClone : Transform = Instantiate(fork);
	
	forkCount++;
	
	return forkClone;
}

function CreateFortification(name : String)
{
	var fortificationClone : Transform = Instantiate(fortification);
	
	fortificationCount++;
	
	return fortificationClone;
}

function FormatUnitName(item : String)
{
	return String.Format("{0}_{1}",
						item,
		 				(item == "fork" ? GetForkCount() : GetFortificationCount()));
}

function RotateToHeading()
{
	gameObject.transform.rotation = Quaternion.identity;
	gameObject.transform.Rotate(new Vector3(0,0,heading));
}

function SetHeading(newHeading : int)
{
	heading = newHeading;
	RotateToHeading();
}

function GetHeading()
{
	return heading;
}

function PositionValid(position : Vector2)
{
	if(position.x >= 0 || position.y >= 0)
		return true;
	else
		return false;
}

function GetNeighbor(relativeDir : int)
{
	var bestResult : Vector2 = GetPosition();
	var dirModifier : int = 1;
		
	switch(heading)
	{
		case HEADING_BACK:
			dirModifier = -1;
		case HEADING_STRAIGHT:
			switch(relativeDir)
			{
				case HEADING_BACK:
				case HEADING_STRAIGHT:
					bestResult.x += 1 * dirModifier;
					break;
					
				case HEADING_BACK_RIGHT:
					bestResult.x -= 1 * dirModifier;
				case HEADING_RIGHT:
					bestResult.y += 1 * dirModifier;
					break;
					
				case HEADING_BACK_LEFT:
					bestResult.x += 1 * dirModifier;
				case HEADING_LEFT:
					bestResult.y -= 1 * dirModifier;
					break;
			}
			break;
			
		case HEADING_BACK_LEFT:
			dirModifier = -1;
		case HEADING_RIGHT:
		switch(relativeDir)
			{
				case HEADING_BACK:
				case HEADING_STRAIGHT:
					bestResult.y += 1 * dirModifier;
					break;
					
				case HEADING_BACK_RIGHT:
					bestResult.y -= 1 * dirModifier;
				case HEADING_RIGHT:
					bestResult.x += 1 * dirModifier;
					break;
					
				case HEADING_BACK_LEFT:
					bestResult.y -= 1 * dirModifier;
				case HEADING_LEFT:
					bestResult.x += 1 * dirModifier;
					break;
			}
			break;
			
		case HEADING_BACK_RIGHT:
			dirModifier = -1;
		case HEADING_LEFT:
			switch(relativeDir)
			{
				case HEADING_BACK:
				case HEADING_STRAIGHT:
					bestResult.y -= 1 * dirModifier;
					break;
					
				case HEADING_BACK_RIGHT:
					bestResult.y += 1 * dirModifier;
				case HEADING_RIGHT:
					bestResult.x += 1 * dirModifier;
					break;
					
				case HEADING_BACK_LEFT:
					bestResult.x -= 1 * dirModifier;
				case HEADING_LEFT:
					bestResult.y -= 1 * dirModifier;
					break;
			}

			break;
	}
		
	return bestResult;
}

function TossItem(item : Transform)
{
	var neighboringPos : Vector2 = GetNeighbor(HEADING_STRAIGHT);
	SetupPiece(item, neighboringPos.x, neighboringPos.y, item_placement, item.name);
}

function GraspItem(item : Transform)
{
	if(null != in_hand)
	{
		TossItem(in_hand);
	}
	
	item.parent = gameObject.transform;
	//item.localPosition.x++;
	//item.localPosition.y++;
}

function CreateItem()
{
	var name : String = FormatUnitName(unitType == "forker" ? "fork" : "fortification");
	var item : Transform;
	switch(unitType)
	{
		case "forker":
			item = CreateFork(name);
			break;
		case "brancher":
			item = CreateFortification(name);
			break;
	}
	
	//GameObject.Find(name).GetComponent(PickupScript).SetPosition(x,y);
	
	GraspItem(item);
}

function SetHomeBase(homeBase : Transform)
{
	home_base = homeBase;
}

function SetTeam(teamPlayer : boolean)
{
	team_player = teamPlayer;
}

function GetForkCount()
{
	return forkCount;
}

function Kill()
{
	dead = true;
	home_base.GetComponent(BaseScript).UnitDeath(unitType);
	Destroy(gameObject);
}


function GetFortificationCount()
{
	return fortificationCount;
}

function DoSelectedGUI(rect : Rect)
{
	GUILayout.BeginArea(rect);
	
	if(GUILayout.Button(String.Format("Create {0}", GetUnitType() == "forker" ? "Fork" : "Fortification")))
	{
		CreateItem();
	}
	
	GUILayout.FlexibleSpace();
	
	
	if(GUILayout.Button("Kill Unit"))
	{
		Kill();
	}

	GUILayout.EndArea();
}

function FindPathTo(x : int, y : int)
{
	// Recursively highlight 
}