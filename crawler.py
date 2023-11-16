from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
import json, sqlite3
from pydantic import BaseModel
import time

# crawler for getting vessel data from evergreen-line.com

class Vessel(BaseModel):
    ShipName: str
    Type: str
    IMO: str
    Length: float
    Width: float

driver = webdriver.Chrome()

root_url = 'https://www.evergreen-line.com/vesselparticulars/jsp/VSL_VesselType.jsp?vslType='
type_list = ['A', 'G', 'T', 'F', 'L', 'S', 'E', 'B', 'O', 'C']

vessels = []

conn = sqlite3.connect('vessel.sqlite')
c = conn.cursor()

for i in type_list:
    driver.get(root_url + i)
    print('Getting vessel data for type ' + i)
    try:
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CLASS_NAME, "card-body")))
        time.sleep(1)   # wait for card to render

        ships = driver.find_elements(By.CLASS_NAME, "card-body")

        for ship in ships:
            ship = ship.text.split('\n')
            # print(ship[0])
            if len(ship) > 1 and ship != None:    
                if not any(vessel.ShipName == ship[0] for vessel in vessels):
                    v = Vessel(
                        ShipName=ship[0], 
                        Type=i,
                        IMO=ship[4], 
                        Length=float(ship[12].replace(',', '.')),
                        Width=float(ship[14].replace(',', '.')))

                    vessels.append(v)

                    c.execute("INSERT INTO vessel VALUES (?, ?, ?, ?, ?)", (v.ShipName, v.Type, v.IMO, v.Length, v.Width))
                    conn.commit()

    except Exception as e:
        print(e)

conn.close()
    
vessels_dict = [vessel.model_dump() for vessel in vessels]

with open('vessels.json', 'w') as f:
    json.dump(vessels_dict, f, indent=4)