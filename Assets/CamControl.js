#pragma strict

var camHeight : int = 12;
var camPos : Vector3 = Vector3(32,camHeight,32);
var posMax : int = 10;
var posMin : int = -10;
var htMax : int = 12;
var htMin : int = 4;

public var currentSelection : GameObject; // hold Fire1-selected
//private var originalColorOfSelected : Color;
public var targetedSelection : GameObject; // hold Fire2-selected
//private var originalColorOfTargeted : Color;
public var mouseoverTarget : GameObject;
private var origin : Vector3 = Vector3(0,0,0);

function Start ()
{
	gameObject.Find("Main Camera").transform.position = origin;
	gameObject.Find("Main Camera").transform.position.y = camHeight;
}

function Update ()
{
	//gameObject.Find("Main Camera").transform.position = camPos;

	//camPos = gameObject.Find("Main Camera").transform.position;
	
	// Camera scrolling
	camPos.y = Mathf.Clamp(camPos.y + Input.GetAxis("Mouse ScrollWheel"), htMin, htMax);
	gameObject.Find("Point light").light.intensity = camPos.y*0.2;
	
	if(Input.GetKey(KeyCode.LeftShift))
	{
		/* Camera movement */
    	camPos.x = Mathf.Clamp(camPos.x + Input.GetAxis("Mouse X"), posMin, posMax);
    	camPos.z = Mathf.Clamp(camPos.z + Input.GetAxis("Mouse Y"), posMin, posMax);
	}
	
	DoMousePicking();
	
	gameObject.Find("Main Camera").transform.position = camPos;
}

function GetCellScript(x,y)
{
	return GameObject.Find(String.Format("HexPlain/cell_{0}_{1}_", x, y)).GetComponent(CellScript);
}

function SetPosition(position : Vector2)
{
	var cellRealPosition : Vector3 = GetCellScript(position.x, position.y).GetRealPosition();
	camPos = Vector3(cellRealPosition.x, gameObject.transform.position.y, cellRealPosition.z);
}

function GetSelectedGUIRect() : Rect
{
	return Rect(Screen.width*0.65, Screen.height*0.7, Screen.width*0.35, Screen.height*0.3);
}

function OnGUI()
{
	if(null != currentSelection)
	{
		if(currentSelection.name.Contains("cell"))
		{
			currentSelection.GetComponent(CellScript).DoSelectedGUI(GetSelectedGUIRect());
		}
		else
		{
			Debug.Log("No patterns matched for currentSelected in OnGUI.");
		}
	}
}

function DoMousePicking()
{
	/* Mouse Picking */
	var ray = Camera.main.ScreenPointToRay(Input.mousePosition);
	var hit : RaycastHit;
	var layerMask : LayerMask = -1;
	
	layerMask = 1 << LayerMask.NameToLayer("GridCells");
	
	if(Input.GetButtonDown("Fire1"))
	{
		// Check if we hit a selectable object like a unit or building
		if(Physics.Raycast(ray, hit, Mathf.Infinity, layerMask))
		{
			SelectObject(hit.transform.gameObject);
		}
	}
	else if((null != currentSelection) && (Input.GetButtonUp("Fire2")))
	{
		// Operate on targetedSelection accordingly
		if(Physics.Raycast(ray, hit, Mathf.Infinity, layerMask))
		{
			TargetObject(hit.transform.gameObject);
		}
	}
	else
	{
		if(Physics.Raycast(ray, hit, Mathf.Infinity, layerMask))
		{
			MouseoverObject(hit.transform.gameObject);
		}
	}

}

function ClearCurrentSelection()
{
	if(currentSelection)
	{
		currentSelection.GetComponent(CellScript).Selected(false);
		currentSelection = null;
	}
}

function ClearCurrentTargeted()
{
	if(targetedSelection)
	{
		targetedSelection.GetComponent(CellScript).Targeted(true);
		targetedSelection = null;
	}
}

function SelectObject(selected : GameObject)
{
	ClearCurrentSelection();
	
	currentSelection = selected;
	
	currentSelection.GetComponent(CellScript).Selected(true);
}

function TargetObject(targeted : GameObject)
{
	ClearCurrentTargeted();
	
	targetedSelection = targeted;

	var targetPos : Vector2 = targetedSelection.GetComponent(CellScript).GetPosition();
	currentSelection.GetComponent(CellScript).Target(targetPos.x, targetPos.y);
}

function MouseoverObject(mouseover : GameObject)
{
	if(currentSelection)
	{
		if(mouseoverTarget != mouseover)
		{
			mouseoverTarget = mouseover;
			
			var mouseoverPos : Vector2 = mouseoverTarget.GetComponent(CellScript).GetPosition();
			currentSelection.GetComponent(CellScript).MouseoverTarget(mouseoverPos);
		}
	}
}
