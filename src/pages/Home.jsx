import {useNavigate} from "react-router-dom"
import money from '../assets/money.jpg'

const Home = () => {
  const moveTo = useNavigate();
  const nextPage = () => {
    moveTo('/Login');
  }
    return (
      <>
      <div className="container fluid p-0">
        <div className="position-relative" style={{height : '100vh'}}>
          <div className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            backgroundImage: `url(${money})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}> 
          </div>

          <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"></div>

          <div className="position-relative p-4" style={{zIndex: 2}}>
          <div className="container p-2">
          <div className="row p-1">
            <div className="col">
              <h1 className="text-center">
                Welcome to the Millionaire Club
              </h1>
            </div>
          </div>
          <div className="row d-flex justify-content-center">
            <h2 className="text-center">Contract <h6>(game rules)</h6> </h2>
            <div
              className="overflow-y-scroll"
              style={{ maxHeight: "700px", maxWidth: "500px" }}
            >
              
              <ul>
                <li>The goal of the game is to be the first to earn
                  one million dollars. 
                </li>
                <li>
                  You can do this by buying different properties, which
                  earns you income when another player lands on them, 
                  collecting your salary, and other ways.  
                </li>
                <li>
                  This is a turn based game. During a player's turn, they 
                  roll a pair of dice which dictates where the player is moved. 
                  Depending on where the player lands they are promted to do 
                  different things. Once their turn ends, they must wait until all 
                  other players go before it is their turn again. 
                </li>
                <li>
                  The game starts with each player choosing their character.
                  Afterwards, every player will roll the dice to determine the 
                  turn order. Every player will then receive the staring amount 
                  of money and be located at the Central Bank space. The game begins!
                </li>
                <li>
                  As previously mentioned, a player wins if they are the first to 
                  earn one million dollars. However there are other ways to win. If 
                  a player cannot pay off other players/properties, they must declare 
                  bankruptcy and are eliminated from the game. If all other players 
                  delcare bankruptcy, you win by default. Additionally, players can 
                  choose to forfeit the game and if all other players forfeit, then you 
                  win by default. 
                </li>
              </ul>

              <h3 className="text-center">Properties</h3>
              <ul>
                <li>
                  This games contains different types of properties that players 
                  can land on. 
                </li>
                <li>
                  Colored Unowned Properties: these kinds of properties can be purchased 
                  by players. When a player lands on these, they are given a Black Card 
                  and are given the choice to buy or ignore this property. Their turn ends.
                </li>
                <li>
                  Colored Owned Properties: these properties are already owned and thus 
                  cannot be repurchased by another player. If a player lands here, they 
                  must pay rent money to the owner. Their turn ends. 
                </li>
                <li>
                  Golden Card Properties: these properties cannot be purchased. If a player 
                  lands here they are given a Golden Card. Their turn ends.
                </li>
                <li>
                  Orange Card: these properties cannot be purchased. If a player 
                  lands here they are given an Orange Card. Their turn ends.
                </li>
                <li>
                  Prison(Visitor): this property cannot be purchased. If a player lands here, 
                  nothing happens and their turn ends. 
                </li>
                <li>
                  Go To Jail: this property cannot be purchased. If a player lands 
                  here, they are moved to prison, their turn ends. 
                </li>
                <li>
                  Public Park: this property cannot be purchased. If a player lands here, nothing 
                  happens and their turn ends. 
                </li>
                <li>
                  Central Bank: this property cannot be purchased, this is also the starting point 
                  for all players. If a player lands here or passes through here, they are given the 
                  option to upgrade their character for $50k. Afterwards, they collect their salary 
                  and continue the game like normal.  
                </li>
              </ul>

              <h3 className="text-center">Cards</h3>
              <ul>
                <li>Black Cards: Black cards are located on every unowned colored property and can only 
                  be used once. There are two types of Black cards: Use Now and Keep Until Needed. Use 
                  Now cards must be used as soon as a player receives them. Keep Until Needed cards can 
                  be used once a player receives it or they can choose to save them. If saved, they can 
                  be used during a player's turn before they roll the dice. 
                </li>
                <li>Golden Cards: Golden Cards are given to players when they land on the respective property. 
                  These cards must always be used once received(except for one specifc card). These cards 
                  depend on either the levels of the players for specific cards. Some cards will require the 
                  player to roll the dice while others don't. Golden cards are always beneficial to the receiving
                  player. 
                </li>
                <li>
                  Orange Card: Orange Cards are given to players when they land on the respective property.
                  These cards must always be used once received. Like Golden Cards, Orange cards also depend on 
                  the levels of the players and some require the player to roll dice. However, unlike Golden 
                  Cards, Orange Cards aren't always beneficial to the player. 
                </li>
              </ul>

              <h3 className="text-center">Prison</h3>
              <ul>
                <li>
                  Prison Restrictions: When a player is imprisoned, they cannot collect any rent money 
                  and they cannot roll the dice to move. 
                </li>
                <li>
                  Escaping Prison: During their turn, the player can either try to escape by rolling 
                  doubles on the dice or by bribing the guards. If a player hasn't escaped by the fourth 
                  turn, they must pay a fine to be released. 
                </li>
              </ul>

              <h3 className="text-center">Colored Properties</h3>
              <ul>
                <li>
                  Buying Properties: Colored properties all have a price tag that players must pay to own a 
                  colored property. If purchased, players are given the title deed which provides information 
                  about the property like rent and house costs. Additionally, if a player purchases all 
                  properties of the same color, the basic rent costs of those properties is doubled, increasing 
                  income for the player.  
                </li>
                <li>
                  Upgrading Properties: Owned colored properties can be upgraded further by purchasing houses. 
                  House costs differ between properties and are stated in the title deed of the property. 
                  Adding houses to a property increases the rent cost of the property, significantly increasing 
                  income. Players can add up to four houses to a property, after that they choose to purhcase a 
                  hotel to further increase rent cost. Hotels are the last building that can be added to a property 
                  and the cost to add a hotel is in the title deed.  
                </li>
                <li>
                  Selling Properties: Players can sell their properties only if they cannot pay for something like 
                  rent to another player. Houses and hotels can be sold for half the price the player paid for them. 
                  Only after that, the player is able to mortgage the property. If a player does this, they receive the 
                  amount stated in the title deed, however as a result they will no longer receive rent money for that 
                  property. As a last resort, players can choose to sell the property to other players for an agreed price. 
                  Mortgaged properties can be repayed for the price shown in the title deed and doing so will allow th owner 
                  to start collecting rent again. 
                </li>
              </ul>
              
            </div>
            <div className="container d-flex justify-content-center p-5">
              <button className="btn btn-dark" onClick={() => nextPage()}>I Agree</button>
            </div>
          </div>
        </div>
          </div> 
        </div>
      </div>
      </>
    );

}


export default Home;