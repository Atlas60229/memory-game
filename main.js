//宣告變數
const GAME_STATE = {
    FirstCardAwait: 'FirstCardAwait',
    SecondCardAwait: 'SecondCardAwait',
    CardsMatchFailed: 'CardMatchFailed',
    CardsMatched: 'CardMatched',
    GameFinished: 'GameFinished'

}
const SYMBOL = [
    'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png','https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', 'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png','https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png'
]
const NUMBER = ['A','2','3','4','5','6','7','8','9','10','J','Q','K']

// MVC 模型
const view = {

    getCardElement(index){
        return `
        <div class="card back" data-index="${index}"></div>`
    
    },
    getCardContent(index){
        const number = NUMBER[(index % 13)]
        const symbol = SYMBOL[Math.floor(index/13)]
        return  `<p>${number}</p><img src="${symbol}" alt=""><p>${number}</p>`
    },

    displayCards(indexes){
        const rootElement = document.querySelector('#cards')
        rootElement.innerHTML = indexes.map(index=>this.getCardElement(index)).join('')
    },

    flipCards(...cards){
        cards.map(card =>{
        // 背面時回傳正面
        if (card.classList.contains('back')){
            card.classList.remove('back')
            card.innerHTML = this.getCardContent(Number(card.dataset.index))
        }else{
        // 正面時回傳背面
        card.classList.add('back')
        card.innerHTML = ''
        }
        })

    },

    pairCards(...cards){
        cards.map(card=>{
            card.classList.add('paired')
        })
    },

    renderScore(scores){
        document.querySelector('#score').textContent = `Score: ${scores}`
    },

    renderTriedTimes(times){
        document.querySelector('#triedTime').textContent = `You've tried ${times} times`
    },

    appendWrongAnimation(...cards){
        cards.forEach(card =>{
            card.classList.add('wrong')
            card.addEventListener('animationend', ()=>{
                card.classList.remove('wrong')
            },
            {
                once: true
            })
        })
    },

    showGameFinished(){
        const header = document.querySelector('#header')
        const div = document.createElement('div')
        div.classList.add('completed')
        div.innerHTML =`
        <p>Congratulation!</p>
        <p>Score: ${model.score}</p>
        <p>You've  tried: ${model.triedTime} times</p>
        `   
        header.append(div)
    }
}

const controller = {
    currentState:  GAME_STATE.FirstCardAwait,
    generateCards(){
        view.displayCards(utility.getRandomNumberArray(52))
    },

    dispatchCardAction(card){
        //根據遊戲狀態執行不同行為
        if (!card.classList.contains('back')) return

        switch(this.currentState){
            case GAME_STATE.FirstCardAwait:
                this.currentState = GAME_STATE.SecondCardAwait
                view.flipCards(card)
                model.revealedCards.push(card)
                return
            case GAME_STATE.SecondCardAwait:
                view.renderTriedTimes(model.triedTime += 1)
                view.flipCards(card)
                model.revealedCards.push(card)
                
                if (model.isRevealedCardMatched()){
                    view.renderScore((model.score += 10))
                    this.currentState = GAME_STATE.CardsMatched
                    view.pairCards(...model.revealedCards)
                    model.revealedCards = []
                    if (model.score === 260){
                        this.currentState = GAME_STATE.GameFinished
                        view.showGameFinished()
                        return
                    }
                    this.currentState = GAME_STATE.FirstCardAwait
                }else{
                    this.currentState = GAME_STATE.CardsMatchFailed
                    view.appendWrongAnimation(...model.revealedCards)
                    setTimeout(controller.resetCards, 1000);
               
                }
        }
    },
    resetCards(){
        view.flipCards(...model.revealedCards)
        console.log(model.revealedCards)
        model.revealedCards = []
        controller.currentState = GAME_STATE.FirstCardAwait
    }
}

const model = {
    revealedCards: [],
    isRevealedCardMatched(){
        return !((Number(this.revealedCards[0].dataset.index) - Number(this.revealedCards[1].dataset.index)) % 13)
    },

    score:0,

    triedTime: 0
}



const utility = {
    getRandomNumberArray(inputNumberArray){
        const number =Array.from(Array(inputNumberArray).keys())
        for (let index = number.length -1; index>0; index--){
            let randomIndex = Math.floor(Math.random() * (index + 1));
            [number[index],number[randomIndex]] = [number[randomIndex],number[index]]
        }
        return number
    }
}

controller.generateCards()

// 宣告事件
document.querySelectorAll('.card').forEach(card =>{
    
    card.addEventListener('click',(event=>{

        controller.dispatchCardAction(card)
    }))
})