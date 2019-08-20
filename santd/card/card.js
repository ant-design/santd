/**
 * @file 组件 card
 * @author chenkai13 <chenkai13@baidu.com>
 */

import './style/index.less';
import san, {DataTypes, NodeType} from 'san';
import {classCreator} from '../core/util';
import LoadingBlock from './loadingBlock';
import Grid from './grid';
import Tabs from '../tabs';

const prefix = classCreator('card')();
export default san.defineComponent({
    template: `
    	<div class="{{cls}}">
            <div s-if="{{showHeader}}" className="${prefix}-head" style="{{headStyle}}">
                <div className="${prefix}-head-wrapper">
                    <div s-if="{{title}}" class="${prefix}-head-title">{{title}}</div>
                    <div s-if="{{isExtra}}" class="${prefix}-extra">
                        <slot name="extra"></slot>
                    </div>
                </div>
                <s-tabs
                    s-if="{{tabList && tabList.length}}"
                    activeTabKey="{{activeTabKey}}"
                    defaultActiveKey="{{defaultActiveKey}}"
                    class="${prefix}-head-tabs"
                    size="large"
                    on-change="onTabChange"
                >
                    <s-tabpane
                        s-for="item in tabList"
                        tab="{{item.tab}}"
                        key="{{item.key}}"
                        disabled="{{disabled}}"
                    />
                </s-tabs>
            </div>
            <div class="${prefix}-cover">
                <slot name="cover"></slot>
            </div>
            <div class="${prefix}-body" style="{{bodyStyle}}" s-ref="content">
                <s-loadingblock s-if="{{loading}}" />
                <slot s-else></slot>
            </div>
            <ul s-if="{{isActions}}" class="${prefix}-actions" s-ref="actionsContain">
                <slot name="actions"></slot>
            </ul>
        </div>
    `,
    components: {
        's-loadingblock': LoadingBlock,
        's-tabs': Tabs,
        's-tabpane': Tabs.TabPane
    },
    initData() {
        return {
            bordered: true
        };
    },
    computed: {
        cls() {
            let loading = this.data.get('loading');
            let bordered = this.data.get('bordered');
            let type = this.data.get('type');
            let tabList = this.data.get('tabList');
            let isContainGrid = this.data.get('isContainGrid');
            let hoverable = !!this.data.get('hoverable');
            let size = this.data.get('size');

            let classArr = [prefix];
            loading && classArr.push(`${prefix}-loading`);
            bordered && classArr.push(`${prefix}-bordered`);
            hoverable && classArr.push(`${prefix}-hoverable`);
            isContainGrid && classArr.push(`${prefix}-contain-grid`);
            tabList && tabList.length && classArr.push(`${prefix}-contain-tabs`);
            !!type && classArr.push(`${prefix}-type-${type}`);
            !!size && classArr.push(`${prefix}-${size}`);

            return classArr;
        }
    },
    inited() {
        let isExtra = !!this.sourceSlots.named['extra'];
        let isActions = !!this.sourceSlots.named['actions'];
        let showHeader = this.data.get('title') || this.data.get('tabList') || isExtra;

        this.data.set('showHeader', showHeader);
        this.data.set('isActions', isActions);
        this.data.set('isExtra', isExtra);
    },
    attached() {
        let defaultSlot = this.slot()[0];
        defaultSlot && this.data.set('isContainGrid', defaultSlot.children.some(slot => slot.constructor === Grid));
        let actSlot = this.slotChildren.filter(child => child.name === 'actions');

        let cmptNodeList = [];
        let loopCMPT = list => {
            list && list.length && list.forEach(item => {
                if (item.nodeType === NodeType.CMPT && item.tagName === 'i') {
                    cmptNodeList.push(item);
                }
                loopCMPT(item.children);
            });
        };
        if (actSlot.length) {
            actSlot = actSlot[0];
            loopCMPT(actSlot.children);
            cmptNodeList.forEach(item => {
                let li = document.createElement('li');
                let span = document.createElement('span');
                li.style = `width: ${100 / cmptNodeList.length}%`;
                span.appendChild(item.el);
                li.appendChild(span);
                this.ref('actionsContain').appendChild(li);
            });
        }
    },
    onTabChange(key) {
        this.fire('tabChange', key);
    }
});
