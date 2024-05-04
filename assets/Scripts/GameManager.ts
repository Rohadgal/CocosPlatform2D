import { _decorator, CCInteger, instantiate, Component, Node, Prefab, Label, Vec3 } from 'cc';
import { BLOCK_SIZE, PlayerController } from './PlayerController';
const { ccclass, property } = _decorator;

enum BlockType{
    BT_NONE,
    BT_STONE,
};

enum GameState{
    GS_INIT,
    GS_PLAYING,
    GS_END,
};

@ccclass('GameManager')
export class GameManager extends Component {

    @property({type: Label}) 
    public stepsLabel: Label|null = null;
    @property({ type: PlayerController }) 
    public playerCtrl: PlayerController | null = null;
    @property({ type: Node })
    public startMenu: Node | null = null;
    @property({type:Prefab})
    public boxPrefab: Prefab|null = null;
    @property({type: CCInteger})
    public roadLength: number = 50;
    private _road: BlockType[] = [];

    start() {
        this.setCurState(GameState.GS_INIT);
        this.playerCtrl?.node.on('JumpEnd', this.onPlayerJumpEnd, this);
    }

    init() {
        //show the start menu
        if (this.startMenu) {
            this.startMenu.active = true;
        }
    
        //generate the map
        this.generateRoad();
    
    
        if (this.playerCtrl) {
    
            //disable input
            this.playerCtrl.setInputActive(false);
    
            //reset player data.
            this.playerCtrl.node.setPosition(Vec3.ZERO);
            this.playerCtrl.reset();
        }
    }
    
    onStartButtonClicked() {
        this.setCurState(GameState.GS_PLAYING);
    }

    setCurState (value: GameState) {
        switch(value) {
            case GameState.GS_INIT: 
                this.init();           
                break;
            case GameState.GS_PLAYING:  
                this.startMenu.active = false;     
                
                //reset steps counter to 0
                if (this.stepsLabel) {
                    this.stepsLabel.string = '0';
                }
                //enable user input after 0.1 second.
                setTimeout(() => {
                    if (this.playerCtrl) {
                        this.playerCtrl.setInputActive(true);
                    }
                }, 0.1);    

                break;
            case GameState.GS_END:
                break;
        }
    }

    onPlayerJumpEnd(moveIndex: number) {
        //update steps label.
        if (this.stepsLabel) {
            this.stepsLabel.string = '' + (moveIndex >= this.roadLength ? this.roadLength : moveIndex);
        }
        this.checkResult(moveIndex);    

    }

    checkResult(moveIndex: number) {
        if (moveIndex < this.roadLength) {
            if (this._road[moveIndex] == BlockType.BT_NONE) {   //steps on empty block, reset to init.
                this.setCurState(GameState.GS_INIT);
            }
        } else {    //out of map, reset to init.
            this.setCurState(GameState.GS_INIT);
        }
    }

    generateRoad() {

        this.node.removeAllChildren();
  
        this._road = [];
        // startPos
        this._road.push(BlockType.BT_STONE);
  
        for (let i = 1; i < this.roadLength; i++) {
            if (this._road[i - 1] === BlockType.BT_NONE) {
                this._road.push(BlockType.BT_STONE);
            } else {
                this._road.push(Math.floor(Math.random() * 2));
            }
        }
  
        for (let j = 0; j < this._road.length; j++) {
            let block: Node | null = this.spawnBlockByType(this._road[j]);
            if (block) {
                this.node.addChild(block);
                block.setPosition(j * BLOCK_SIZE, 0, 0);
            }
        }
    }

    spawnBlockByType(type: BlockType) {
        if (!this.boxPrefab) {
            return null;
        }
  
        let block: Node|null = null;
        switch(type) {
            case BlockType.BT_STONE:
                block = instantiate(this.boxPrefab);
                break;
        }
  
        return block;
    }

    update(deltaTime: number) {
        
    }
}


