#pragma strict

var base : Transform;
var branch_bush : Transform;

private var inhabitant : Transform;
private var inhabitant_occupied : boolean = false;
var inhabitant_pos : Vector2 = new Vector2(0, 0);

/*
private var bush : Transform;
private var bush_occupied : boolean = false;
var bush_pos : Vector2 = new Vector2(.5, -.5);
private var item_drop_a : Transform;
private var item_drop_a_occupied : boolean = false;
var item_drop_a_pos : Vector2 = new Vector2(-.5, .5);
private var item_drop_b : Transform;
private var item_drop_b_occupied : boolean = false;
var item_drop_b_pos : Vector2 = new Vector2(-.5, -.5);
*/

// This table corresponds to the one in UnitScript.js regarding HEADING
private var NUMBER_OF_NEIGHBORS : int = 6;
private var NEIGHBOR_AHEAD : int = 0;
private var NEIGHBOR_AHEAD_ANGLE : int = 0;
private var NEIGHBOR_AHEAD_POS : Vector2;

private var NEIGHBOR_LEFT : int = 1;
private var NEIGHBOR_LEFT_ANGLE : int = 60;
private var NEIGHBOR_LEFT_POS : Vector2;

private var NEIGHBOR_BACK_LEFT : int = 2;
private var NEIGHBOR_BACK_LEFT_ANGLE : int = 120;
private var NEIGHBOR_BACK_LEFT_POS : Vector2;

private var NEIGHBOR_RIGHT : int = 3;
private var NEIGHBOR_RIGHT_ANGLE : int = -60;
private var NEIGHBOR_RIGHT_POS : Vector2;

private var NEIGHBOR_BACK_RIGHT : int = 4;
private var NEIGHBOR_BACK_RIGHT_ANGLE : int = -120;
private var NEIGHBOR_BACK_RIGHT_POS : Vector2;

private var NEIGHBOR_BEHIND : int = 5;
private var NEIGHBOR_BEHIND_ANGLE : int = 180;
private var NEIGHBOR_BEHIND_POS : Vector2;

private var idx = {NEIGHBOR_AHEAD_ANGLE : NEIGHBOR_AHEAD,
				   NEIGHBOR_LEFT_ANGLE : NEIGHBOR_LEFT,
				   NEIGHBOR_BACK_LEFT_ANGLE : NEIGHBOR_BACK_LEFT,
				   NEIGHBOR_RIGHT_ANGLE : NEIGHBOR_RIGHT,
				   NEIGHBOR_BACK_RIGHT_ANGLE : NEIGHBOR_BACK_RIGHT,
				   NEIGHBOR_BEHIND_ANGLE : NEIGHBOR_BEHIND};

private var neighbors : Vector2[] = new Vector2[NUMBER_OF_NEIGHBORS];
private var myLocation : Vector2 = Vector2(-1,-1);

private var selectedHighlightOn : boolean = false;
private var selectedHighlightColor : Color = Color.green;
private var selectedHighlightMod : float = 0.5;

private var pathHighlightColor_valid : Color = Color.white;
private var pathHighlightColor_invalid : Color = Color.red;
private var pathHighlightColor_out_of_range : Color = Color.gray;
private var pathHighlightOn : boolean = false;
private var pathHighlightMod : float = 0.5;
private var pathHighlightColor : Color = pathHighlightColor_out_of_range;

private var targetedHighlightColor_passive : Color = Color.blue;
private var targetedHighlightColor_invalid : Color = Color.red;
private var targetedHighlightOn : boolean = false;
private var targetedHighlightColor : Color = Color.blue;
private var targetedHighlightMod : float = 0.5;
private var targetedHighlightTimediff : float = 0;

private var mouseoverHighlightOn : boolean = false;
private var mouseoverHighlightColor : Color = Color.yellow;
private var mouseoverHighlightMod : float = 0.5;

private var show_failed_target : boolean = false;

private var selectable : boolean = false;


function Start () {

	// Parse this cell's position
	var delimiter : String = "_";
	var coordStrings = gameObject.name.Split(delimiter.ToCharArray());
	myLocation = new Vector2(parseInt(coordStrings[1]), parseInt(coordStrings[2]));
	Debug.Log(String.Format("Cell: {0}",myLocation));

	// Particle system off initially	
	ToggleParticleSystem(false);
}

function Update ()
{
	if(pathHighlightOn)
	{
		DoPathHighlight();
	}
	else if(mouseoverHighlightOn)
	{
		DoMouseoverHighlight();
	}
	else if(selectedHighlightOn)
	{
		DoSelectedHighlight();
	}
	else if(targetedHighlightOn)
	{
		DoTargetedHighlight();
	}
}

function GetPosition() : Vector2
{
	return myLocation;
}

function MousedOver()
{
	mouseoverHighlightOn = true;
}

function MouseExited()
{
	mouseoverHighlightOn = false;
	mouseoverHighlightMod = 0.5;
	ToggleParticleSystem(false);
}

function Target(x : int, y : int)
{
	var piece : Transform = GetInhabitant();
	
	if(selectable)
	{
		if(piece.name.Contains("forker") || piece.name.Contains("brancher"))
		{
			piece.GetComponent(UnitScript).SetTarget(x,y);
		}
		else if(piece.name.Contains("base"))
		{
			piece.GetComponent(BaseScript).SetTarget(x,y);
		}
	}
}

function Targeted(val : boolean)
{
	if(false == val)
	{
		targetedHighlightOn = false;
		targetedHighlightMod = 0.5;
		ToggleParticleSystem(false);
	}
	else
	{
		if(SlotInhabited())
		{
			targetedHighlightOn = val;
			targetedHighlightMod = 0.5;
			targetedHighlightTimediff = 0;
		}
	}
}

function Selected(val : boolean)
{
	if(false == val)
	{
		selectedHighlightOn = false;
		selectedHighlightMod = 0.5;
		ToggleParticleSystem(false);
	}
	else
	{
		if(SlotInhabited())
		{
			var piece : Transform = GetInhabitant();

			// Determine if the object here can even be selected so as to ignore further stimulus
			if(piece.name.Contains("forker") || piece.name.Contains("brancher"))
			{
				selectable = piece.GetComponent(UnitScript).Selected(val);
			}
			else if(piece.name.Contains("base"))
			{
				selectable = piece.GetComponent(BaseScript).Selected(val);
			}
			else if(piece.name.Contains("bush"))
			{
				selectable = piece.GetComponent(BushScript).Selected(val);
			}
			else if(piece.name.Contains("branch") || piece.name.Contains("fork") || piece.name.Contains("fortification"))
			{
				selectable = piece.GetComponent(PickupScript).Selected(val);
			}
			
			if(selectable)
			{
				selectedHighlightOn = true;
				selectedHighlightMod = 0.5;
			}
		}
	}
}


function DoSelectedGUI(rect : Rect)
{
	var piece : Transform = GetInhabitant();

	if(selectable)
	{
		if(piece.name.Contains("forker") || piece.name.Contains("brancher"))
		{
			piece.GetComponent(UnitScript).DoSelectedGUI(rect);
		}
		else if(piece.name.Contains("base"))
		{
			piece.GetComponent(BaseScript).DoSelectedGUI(rect);
		}
		else if(piece.name.Contains("bush"))
		{
			piece.GetComponent(BushScript).DoSelectedGUI(rect);
		}
		else if(piece.name.Contains("branch") || piece.name.Contains("fork") || piece.name.Contains("fortification"))
		{
			piece.GetComponent(PickupScript).DoSelectedGUI(rect);
		}
	}
}



function SetPathHighlight(val : boolean, type : String)
{
	pathHighlightOn = val;
	pathHighlightMod = 0.5;
	
	if(pathHighlightOn)
	{
		switch(type)
		{
			case "valid":
				pathHighlightColor = pathHighlightColor_valid;
				break;
			case "invalid":
				pathHighlightColor = pathHighlightColor_invalid;
				break;
			case "out_of_range":
				pathHighlightColor = pathHighlightColor_out_of_range;
				break;
		}
	}
	else
	{
		ToggleParticleSystem(false);
	}
}

function GetParticleSystem() : ParticleSystem
{
	return gameObject.GetComponent(ParticleSystem);
}

function ToggleParticleSystem(on : boolean)
{
	var particleSystem : ParticleSystem = GetParticleSystem();
	if(on)
	{
		if(!particleSystem.isPlaying)
			particleSystem.Play();
	}
	else
	{
		particleSystem.Stop();
		particleSystem.Clear();
	}
}

function FadeColor(color : Color, mod : float, speed : int) : float
{
	var direction : int = 100 > mod ? 1 : -1;
	
	mod += direction * speed * Time.deltaTime;
	color.a += mod;
	
	//gameObject.renderer.material.color = color;
	
	GetParticleSystem().renderer.material.color = color;
	ToggleParticleSystem(true);
	
	return Time.deltaTime;
}

function DoMouseoverHighlight()
{
	FadeColor(mouseoverHighlightColor, mouseoverHighlightMod, 5);
}

function DoTargetedHighlight()
{
	targetedHighlightTimediff += FadeColor(targetedHighlightColor, targetedHighlightMod, 10);
	
	if(targetedHighlightTimediff >= 2)
	{
		targetedHighlightOn = false;
	}
}

function DoSelectedHighlight()
{
	FadeColor(selectedHighlightColor, selectedHighlightMod, 2);
}

function DoPathHighlight()
{
	FadeColor(pathHighlightColor, pathHighlightMod, 3);
}

function PositionValid(x : int, y : int) : boolean
{
	var size : Vector2 = GameObject.Find("HexPlain").GetComponent(HexBoardScript).GetSize();
	
	if((0 > x) || (size.x < x) ||
	   (0 > y) || (size.y < y))
		return false;
	
	return true;
}

function GetNeighbor(neighbor : int) : Vector2
{
	var neighborPos : Vector2 = Vector2(-1,-1);
	
	switch(neighbor)
	{
		case NEIGHBOR_AHEAD:
			if(PositionValid(myLocation.x+1, myLocation.y))
				neighborPos =  Vector2(myLocation.x+1, myLocation.y);
			break;
		case NEIGHBOR_BEHIND:
			if(PositionValid(myLocation.x-1, myLocation.y))
				neighborPos = Vector2(myLocation.x-1, myLocation.y);
			break;
		case NEIGHBOR_LEFT:
			if(PositionValid(myLocation.x, myLocation.y-1))
				neighborPos = Vector2(myLocation.x, myLocation.y-1);
			break;
		case NEIGHBOR_RIGHT:
			if(PositionValid(myLocation.x, myLocation.y+1))
				neighborPos = Vector2(myLocation.x, myLocation.y+1);
			break;
		case NEIGHBOR_BACK_LEFT:
			if(PositionValid(myLocation.x-1, myLocation.y-1))
				neighborPos = Vector2(myLocation.x-1, myLocation.y-1);
			break;
		case NEIGHBOR_BACK_RIGHT:
			if(PositionValid(myLocation.x-1, myLocation.y+1))
				neighborPos = Vector2(myLocation.x-1, myLocation.y+1);
			break;
	}
	
	return neighborPos;
}


function GetInhabitant(/*slot : String*/) : Transform
{
	var piece : Transform;
	
	/*
	if(SlotInhabited(slot))
	{
		if("inhabitant" == slot)
		{*/
			piece = inhabitant;
		/*
		}
		else if("drop_a" == slot)
		{
			piece = item_drop_b;
		}
		else if("drop_b" == slot)
		{
			piece = item_drop_b;
		}
		else if("bush" == slot)
		{
			piece = bush;
		}
	}*/
	
	return piece;
}

function SlotInhabited(/*slot : String*/) : boolean
{
	/*
	if("inhabitant" == slot)
	{
	*/
		return inhabitant_occupied;
	/*
	}
	else if("drop_a" == slot)
	{
		return item_drop_a_occupied;
	}
	else if("drop_b" == slot)
	{
		return item_drop_b_occupied;
	}
	else if("bush" == slot)
	{
		return bush_occupied;
	}
	

	return true;
	*/
}

function SlotPos(/*slot : String*/) : Vector2
{	
	var slotPosition : Vector2 = new Vector2(-1,-1);
	
	/*
	if("inhabitant" == slot)
	{*/
		slotPosition = inhabitant_pos;
		/*
	}
	else if("drop_a" == slot)
	{
		slotPosition = item_drop_a_pos;
	}
	else if("drop_b" == slot)
	{
		slotPosition = item_drop_b_pos;
	}
	else if("bush" == slot)
	{
		slotPosition = bush_pos;
	}*/

	return slotPosition;
}

// I broke this out because its reused a few times.
function PositionInhabitant(/*slot : String, */new_inhabitant : Transform, z : float)
{
	//var z = new_inhabitant.localPosition.z;
	new_inhabitant.parent = gameObject.transform;
	new_inhabitant.localPosition = Vector3(SlotPos(/*slot*/)[0], SlotPos(/*slot*/)[1], z);
}

function ClearInhabitant(/*slot : String*/)
{
/*
	if("inhabitant" == slot)
	{*/
		inhabitant_occupied = false;
		inhabitant = null;
	/*
	}
	else if("drop_a" == slot)
	{
		item_drop_a_occupied = false;
	}
	else if("drop_b" == slot)
	{
		item_drop_b_occupied = false;
	}
	else if("bush" == slot)
	{
		bush_occupied = false;
	}*/
}


function SetInhabitant(/*type : String, */new_inhabitant : Transform) : boolean
{	
	var result : boolean = true;
	var position : Vector2;
	
	if( !SlotInhabited(/*"inhabitant"*/) )
	{
		if(new_inhabitant.name.Contains("forker") || new_inhabitant.name.Contains("brancher"))
		{
			position = new_inhabitant.GetComponent(UnitScript).GetPosition();
		
			if(PositionValid(position.x, position.y))
			{
				// MoveFrom previous position
				GameObject.Find(String.Format("/HexPlain/_{0}_{1}_", position.x, position.y)).GetComponent(CellScript).MoveFrom(new_inhabitant);
			}
	
			// MoveTo this position
			PositionInhabitant(/*"inhabitant", */new_inhabitant, 3.0);
			
			new_inhabitant.GetComponent(UnitScript).SetPosition(myLocation.x, myLocation.y);
		}
		else if(new_inhabitant.name.Contains("base"))
		{			
			position = new_inhabitant.GetComponent(BaseScript).GetPosition();
		
			if(PositionValid(position.x, position.y))
			{
				// MoveFrom previous position
				GameObject.Find(String.Format("/HexPlain/_{0}_{1}_", position.x, position.y)).GetComponent(CellScript).MoveFrom(new_inhabitant);
			}
			
			// MoveTo this position
			PositionInhabitant(/*"inhabitant", */new_inhabitant, 3.0);
			
			new_inhabitant.GetComponent(BaseScript).SetPosition(myLocation.x, myLocation.y);
		}
		else if(new_inhabitant.name.Contains("bush"))
		{
			position = new_inhabitant.GetComponent(BushScript).GetPosition();
		
			if(PositionValid(position.x, position.y))
			{
				// MoveFrom previous position
				GameObject.Find(String.Format("/HexPlain/_{0}_{1}_", position.x, position.y)).GetComponent(CellScript).MoveFrom(new_inhabitant);
			}
			
			// MoveTo this position
			PositionInhabitant(/*"inhabitant", */new_inhabitant, 3.0);
			
			new_inhabitant.GetComponent(BushScript).SetPosition(myLocation.x, myLocation.y);
		}
		else if(new_inhabitant.name.Contains("branch") || new_inhabitant.name.Contains("fork") || new_inhabitant.name.Contains("fortification"))
		{
			position = new_inhabitant.GetComponent(PickupScript).GetPosition();
		
			if(PositionValid(position.x, position.y))
			{
				// MoveFrom previous position
				GameObject.Find(String.Format("/HexPlain/_{0}_{1}_", position.x, position.y)).GetComponent(CellScript).MoveFrom(new_inhabitant);
			}
			
			// MoveTo this position
			PositionInhabitant(/*"inhabitant", */new_inhabitant, 3.0);
			
			new_inhabitant.GetComponent(PickupScript).SetPosition(myLocation.x, myLocation.y);
		}
		else
		{
			return false;
		}
	}
	else
	{
		// Toggle some UI to depict a failed attempt to position here
	}
	
	return result;
}

function MoveTo(piece : Transform) : boolean
{
	var result : boolean = true;
	
	/* Name must be set before this point */
	Debug.Log(String.Format("MoveTo {0}", myLocation));
	
	SetInhabitant(piece);
	
	return result;
}

function MoveFrom(piece : Transform) : boolean
{
	var result : boolean = true;
	
	Debug.Log(String.Format("MoveFrom {0}",myLocation));
	
	/*
	if(piece.name.Contains("forker") || piece.name.Contains("brancher"))
	{
	*/
	
	if(SlotInhabited(/*"inhabitant"*/) && GetInhabitant(/*"inhabitant"*/).name.Equals(piece.name))
	{
		ClearInhabitant(/*"inhabitant"*/);
	}
	else
	{
		result = false;
	}
	
	/*
	}
	else if(piece.name.Contains("branch") || piece.name.Contains("fork") || piece.name.Contains("fortification"))
	{
		if(SlotInhabited("drop_a") && GetInhabitant("drop_a").name.Equals(piece.name))
		{
			ClearInhabitant("drop_a");
		}
		else if(SlotInhabited("drop_b") && GetInhabitant("drop_b").name.Equals(piece.name))
		{
			ClearInhabitant("drop_b");
		}
	}
	else if(piece.name.Contains("branchbush"))
	{
		ClearInhabitant("bush");
	}
	else if(piece.name.Contains("base"))
	{
		ClearInhabitant("base");
	}*/
	
	return result;
}

function CreateBush(id : int) : boolean
{
	var result : boolean = false;
	
	var bushClone : Transform = Instantiate(branch_bush);
	bushClone.name = String.Format("bush_{0}", id);

	result = MoveTo(bushClone);
	if(result)
	{
		bushClone.GetComponent(BushScript).SetPosition(myLocation.x, myLocation.y);
	}
	
	return result;
}

function CreateBase(name : String, player : boolean, baseType : String) : boolean
{
	var result : boolean = false;
		
	var baseClone : Transform = Instantiate(base);
	baseClone.name = name;

	result = MoveTo(baseClone);
	if(result)
	{
		var baseScript : BaseScript = baseClone.GetComponent(BaseScript);
		baseScript.SetBaseType(baseType);
		baseScript.SetPlayerType(player);
		baseScript.SetPosition(myLocation.x, myLocation.y);
	}
	
	return result;
}