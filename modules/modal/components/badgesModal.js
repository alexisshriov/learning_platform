import React from 'react';
import ReactTimeout from 'react-timeout';
import Tracking from "../../../helpers/tracking";

class BadgesModal extends React.Component {
    constructor(props) {
        super(props);
        this.PAGE_SIZE = 12;
        this.next = this.next.bind(this);
        this.previous = this.previous.bind(this);
        this.toPage = this.toPage.bind(this);
        this.badgeDetail = this.badgeDetail.bind(this);
        // Sets page to 0
        this.props.resetPage();

        this.state = {
            navClass: '',
            nextButton: {
                disabled: false,
                state: 'ready'
            },
            previousButton: {
                disabled: false,
                state: 'ready'
            }
        }
    }

    next() {
        if(!this.state.nextButton.disabled) {
          this.state.nextButton.state = 'clicked';
          this.props.setTimeout(()=>{
            this.state.nextButton.state = 'ready';
            this.forceUpdate();
          }, 200);
          let playerId = this.props.player.currentPlayerId;
          let currentPlayerProgress = null;
          if(playerId && this.props.player.progress[playerId]){
            currentPlayerProgress = this.props.player.progress[playerId];
          }
          let badges = currentPlayerProgress.badges;
          let keys = Object.keys(badges.allBadges);
          let numPages = Math.ceil(keys.length / this.PAGE_SIZE);
          if (this.props.badges.pageNo < numPages-1) {
            this.props.nextPage();
            this.forceUpdate();
          }
        }
    }

    previous() {
        if(!this.state.previousButton.disabled) {
          this.state.previousButton.state = 'clicked';
          this.props.setTimeout(() => {
            this.state.previousButton.state = 'ready';
            this.forceUpdate();
          }, 200);
          if (this.props.badges.pageNo > 0) {
            this.props.previousPage();
            this.forceUpdate();
          }
        }
    }

    /**
     * Page jump from pagination onClick
     * @param {*} pageNo The page to jump to
     */
    toPage(pageNo) {
        if(this.props.badges.pageNo!==pageNo){
          this.props.toPage({pageNo: pageNo});
        }
    }


    /**
     * Mini badge stack on badge hover
     */
    badgeDetail(badge) {
        let smallBadges = [];
        if (badge.quantity > 1) {
            for (var i = 0; i < badge.quantity; i++) {
                let left = i*9 - 15;
                let time = i*75 + 'ms';
                if (left > 100) {
                    break;
                }
                smallBadges.push(
                    <img className='badge-image-small' key={i} style={{left: left, animationDelay: time}}
                    src={prefixCDN(badge.imagePath)} />
                );
            }

            return (
                <div className='badge-quantity-container'>
                    {smallBadges}
                </div>
            );
        } else return;
    }

    componentDidMount() {
        Tracking.track('Viewed Badge Modal');
    }

    render() {
        const badgePage = [];
        const pagination = [];
        let playerId = this.props.player.currentPlayerId;
        let player = this.props.player.players.noGroups.children[playerId];
        let currentPlayerProgress = null;
        if(playerId && this.props.player.progress[playerId]){
          currentPlayerProgress = this.props.player.progress[playerId];
        }
        let badges = currentPlayerProgress.badges;
        let keys = Object.keys(badges.allBadges);
        let numPages = Math.ceil(keys.length / this.PAGE_SIZE);
        let badgeCount = 0;
        // Moves only first page by -100%s
        let page0Props = {
            marginLeft: (this.props.badges.pageNo * -100)+'%'
        };

        if(this.props.badges.pageNo < 1){
            this.state.previousButton.disabled = true;
        } else {
            this.state.previousButton.disabled = false;
        }

        if(this.props.badges.pageNo >= numPages-1){
            this.state.nextButton.disabled = true;
        } else {
            this.state.nextButton.disabled = false;
        }

        // Hides all page navs when necessary
        if(numPages<=1){
        this.state.navClass = 'hidden';
        } else {
        this.state.navClass = '';
        }

        for (var p = 0; p < numPages; p++) {
            let badgeItems = [];
            for (var i = 0; i < this.PAGE_SIZE; i++) {
                if (p * (this.PAGE_SIZE + i) >= badges.totalBadges) break;
                let notification = null;
                let badge = badges.allBadges[keys[badgeCount++]];
                if (badge) {
                    // Toast render
                    if (badge.quantity > 1) {
                        notification = (<div className="badge-count-container">
                            <div className="badge-count">{badge.quantity}</div>
                        </div>);
                    }

                    // Badge render
                    badgeItems.push(
                        <div className="badge" key={badgeCount}>
                            <div className="badge-image">
                                <img src={prefixCDN(badge.imagePath)} />
                                { notification }
                            </div>
                            <div className="badge-type">{badge.title}</div>
                            <div className="hidden detail">
                                {badge.description}
                                {this.badgeDetail(badge)}
                            </div>
                        </div>
                    );
                }
            }

            // Page of badges
            badgePage.push(
            <div className="page" key={`group_${this.props.groupId}_page_${p}`} data-page={`${p}`} style={page0Props}>
                { badgeItems }
            </div>
            );

            // Page bullets
            pagination.push(
            <div className={`page_bullet ${p === this.props.badges.pageNo ? 'active' : ''}`} key={`page_bullet_${p}`}
                    data-page={`${p}`} onClick={(event)=>{this.toPage(Number(event.target.getAttribute('data-page')))}}>
                <div className="inner_bullet"/>
            </div>
            );

            page0Props = {};
        }

        return (
            <div className="badges_modal_container">
                <div className="playerStats_container left">
                    <div className="playerAvatar">
                        <div className={'avatar '+player.avatar.internal_name} />
                    </div>
                    <div className="playerName">{player.PlayerName}</div>

                    <div className="playerBadges">
                        <div className="icon awards"><i /></div>
                        <div className="statSection">
                            <div className="statTitles">AWARDS</div>
                            <br/><br/>
                            <div className="newlyEarned">Newly Earned</div>
                            <div className={`newlyEarned value ${badges.badgesRecentNum ? 'gained' : ''}`}>{badges.badgesRecentNum}</div>
                            <div className="indicator">(last 7 days)</div>
                            <div className="totalBadges">Total</div>

                            <div className="totalBadges value">{badges.totalBadges}</div>
                        </div>
                    </div>

                    <div className="playerPoints">
                        <div className="icon points"><i /></div>
                        <div className="statSection">
                            <div className="statTitles">POINTS</div>
                            <br/><br/>
                            <div className="totalPoints">Total</div>
                            <div className="totalPoints value">{currentPlayerProgress.pointsCount}</div>
                        </div>
                    </div>

                </div>
                <div className="awards_container right">
                    <div className="inner">
                        <h1>Awards</h1> {/* @todo add tooltip somewhere */}
                        <div className="awardsList">
                            { badgePage }
                        </div>
                    </div>
                    <div className={`
                        next_button
                        ${this.state.navClass}
                        ${this.state.nextButton.state==='clicked' ? 'clicked' : ''}
                        ${this.state.nextButton.disabled ? 'disabled' : ''}
                        `} onClick={this.next}>
                        <div className="inner_button">
                            <i />
                        </div>
                    </div>
                    <div className={`
                        previous_button
                        ${this.state.navClass}
                        ${this.state.previousButton.state==='clicked' ? 'clicked' : ''}
                        ${this.state.previousButton.disabled ? 'disabled' : ''}
                        `} onClick={this.previous}>
                        <div className="inner_button">
                            <i />
                        </div>
                    </div>
                    <div className={`pagination ${this.state.navClass}`}>
                        {pagination}
                    </div>
                </div>
            </div>
        );
    }
};

export default ReactTimeout(BadgesModal);
