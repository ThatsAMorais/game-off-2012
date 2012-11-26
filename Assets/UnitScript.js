#pragma strict



// Public
var fork : GameObject;
var fortification : GameObject;
var item_placement = 0;
var team_player : boolean = false;
var home_base : GameObject = null;
var unitType : String;
var ACTION_POINTS_PER_TURN : int = 3;
var dead : boolean = false;
var MAX_UNIT_HEALTH = 64;

private var HEADING_STRAIGHT = 0;
private var HEADING_LEFT = 60;
private var HEADING_BACK_LEFT = 120;
private var HEADING_RIGHT = -60;
private var HEADING_BACK_RIGHT = -120;
private var HEADING_BACK = 180;

var heading : int = HEADING_STRAIGHT;

// Stats
private var health : int = MAX_UNIT_HEALTH;
private var forkCount : int = 0;
private var fortificationCount : int = 0;

// States and Status
private var newly_created : boolean = true;
private var branches_held : int = 0;
private var world_position : Vector2 = Vector2(-1,-1);
private var in_hand : GameObject = null;

private var selected : boolean = false;
private var action_points = ACTION_POINTS_PER_TURN;
private var target_position : Vector2;

// Animate variables
private var newly_created_rotation = 0;

function Start ()
{
	// Determine the unit-type
	unitType = gameObject.name.Contains("forker") ? "forker" : "brancher";
	gameObject.transform.Rotate(gameObject.name.Contains("forker") ? 0 : 90, 0, 0);
	
	// Disabling this for now.
	//newly_created = false;
	
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
		 				(item == "fork" ? GetForkCount() : GetFortificationCount()));
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

function GetHeading() : int
{
	return heading;
}

function GetCellScript(x : int, y : int) : CellScript
{
	var pos : Vector2 = new Vector2((x == -1) ? world_position.x : x, (y == -1) ? world_position.y : y);
	
	return GameObject.Find(String.Format("HexPlain/cell_{0}_{1}_", pos.x, pos.y)).GetComponent(CellScript);
}

function GetNeighbor(direction : int) : Vector2
{
	var neighborDir = (heading + direction);
	neighborDir = ((neighborDir-180)%360) + (neighborDir < 180 ? 180 : -180);
	neighborDir = (neighborDir == -180) ? 180 : neighborDir;
	Debug.Log(neighborDir);
	
	var neighborPos : Vector2 = GetCellScript(world_position.x, world_position.y).GetNeighbor(neighborDir);
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
	/*SetupPiece(item, neighboringPos.x, neighboringPos.y, item_placement, item.name);*/
	
	var result : boolean = false;
	
	if(false == GetCellScript(world_position.x, world_position.y).MoveTo(item))
	{
		var current_heading = HEADING_BACK;
		var neighbor = GetNeighbor(current_heading);

		while(false == GetCellScript(neighbor.x, neighbor.y).MoveTo(item))
		{
			current_heading += HEADING_RIGHT;
			
			if((-1 * HEADING_BACK) <= current_heading)
			{
				break;
			}
			
			neighbor = GetNeighbor(current_heading);
		}
	}
	
	return result;
}

function GraspItem(item : GameObject)
{
	if(null != in_hand)
	{
		TossItem(in_hand);
	}
	
	item.transform.parent = gameObject.transform;
	if(item.name.Contains("fork"))
	{
		item.transform.localPosition = Vector3(-1,1,0);
		item.transform.localRotation = Quaternion.identity;
		item.transform.Rotate(Vector3(0,180,90));
		item.transform.localScale = Vector3(0.2,0.2,0.2);
	}
	else if(item.name.Contains("fortification"))
	{
		item.transform.localPosition = Vector3(-1,1,0);
		item.transform.localScale = Vector3(0.3,0.3,0.2);
	}
	
	item.GetComponent(PickupScript).SetPosition(GetPosition().x, GetPosition().y);
}

function CreateItem()
{
	var name : String = FormatUnitName(unitType == "forker" ? "fork" : "fortification");
	var item : GameObject;
	switch(unitType)
	{
		case "forker":
			item = CreateFork();
			break;
		case "brancher":
			item = CreateFortification();
			break;
	}
	
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
		dead = true;
		home_base.GetComponent(BaseScript).UnitDeath(unitType);
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
	
	if(GUILayout.Button(String.Format("Create {0}", GetUnitType() == "forker" ? "Fork" : "Fortification")))
	{
		CreateItem();
	}
	
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
	GUILayout.TextField(String.Format("Number of {0}s made : {1}",
									 GetUnitType() == "forker" ? "fork" : "fortification",
									 GetUnitType() == "forker" ? GetForkCount() : GetFortificationCount()));
}

function Selected(selected : boolean) : boolean
{
	// TODO: Do a Selected animation
	
	// TODO: React to being selected in some way
		
	return true;
}

function FindPathTo(x : int, y : int)
{
	// Recursively highlight 
}