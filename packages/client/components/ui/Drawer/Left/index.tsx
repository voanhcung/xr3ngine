import React, { useState, useEffect } from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { selectAuthState } from '../../../../redux/auth/selector';
import { selectChatState } from '../../../../redux/chat/selector';
import { selectFriendState } from '../../../../redux/friend/selector';
import { selectGroupState } from '../../../../redux/group/selector';
import { selectPartyState } from '../../../../redux/party/selector';
import { selectUserState } from '../../../../redux/user/selector';
import { selectLocationState } from '../../../../redux/location/selector';
import styles from './Left.module.scss';

import {
    updateInviteTarget
} from '../../../../redux/invite/service';
import {
    updateChatTarget,
    updateMessageScrollInit
} from '../../../../redux/chat/service';
import {
    getFriends,
    unfriend
} from '../../../../redux/friend/service';
import {
    getGroups,
    createGroup,
    patchGroup,
    removeGroup,
    removeGroupUser
} from '../../../../redux/group/service';
import {
    getLayerUsers
} from "../../../../redux/user/service";
import {
    banUserFromLocation
} from '../../../../redux/location/service';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Avatar,
    Button,
    Divider,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    SwipeableDrawer,
    TextField,
    Tooltip,
    Typography
} from '@material-ui/core';
import {
    Add,
    ArrowLeft,
    Block,
    Delete,
    Edit,
    ExpandMore,
    Forum,
    Group,
    GroupWork,
    PersonAdd,
    Public,
    SupervisedUserCircle
} from "@material-ui/icons";
import _ from 'lodash';
import { Group as GroupType } from '@xr3ngine/common/interfaces/Group';
import { User } from '@xr3ngine/common/interfaces/User';
import {
    getParty,
    createParty,
    removeParty,
    removePartyUser,
    transferPartyOwner
} from '../../../../redux/party/service';
import classNames from 'classnames';


const mapStateToProps = (state: any): any => {
    return {
        authState: selectAuthState(state),
        chatState: selectChatState(state),
        friendState: selectFriendState(state),
        groupState: selectGroupState(state),
        locationState: selectLocationState(state),
        partyState: selectPartyState(state),
        userState: selectUserState(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    getFriends: bindActionCreators(getFriends, dispatch),
    unfriend: bindActionCreators(unfriend, dispatch),
    getGroups: bindActionCreators(getGroups, dispatch),
    createGroup: bindActionCreators(createGroup, dispatch),
    patchGroup: bindActionCreators(patchGroup, dispatch),
    removeGroup: bindActionCreators(removeGroup, dispatch),
    removeGroupUser: bindActionCreators(removeGroupUser, dispatch),
    getParty: bindActionCreators(getParty, dispatch),
    createParty: bindActionCreators(createParty, dispatch),
    removeParty: bindActionCreators(removeParty, dispatch),
    removePartyUser: bindActionCreators(removePartyUser, dispatch),
    transferPartyOwner: bindActionCreators(transferPartyOwner, dispatch),
    updateInviteTarget: bindActionCreators(updateInviteTarget, dispatch),
    updateChatTarget: bindActionCreators(updateChatTarget, dispatch),
    updateMessageScrollInit: bindActionCreators(updateMessageScrollInit, dispatch),
    getLayerUsers: bindActionCreators(getLayerUsers, dispatch),
    banUserFromLocation: bindActionCreators(banUserFromLocation, dispatch)
});

interface Props {
    harmony: boolean;
    leftDrawerOpen: boolean;
    setLeftDrawerOpen: any;
    setRightDrawerOpen: any;
    authState?: any;
    friendState?: any;
    userState?: any;
    getFriends?: any;
    unfriend?: any;
    groupState?: any;
    getGroups?: any;
    createGroup?: any;
    patchGroup?: any;
    removeGroup?: any;
    removeGroupUser?: any;
    locationState?: any;
    partyState?: any;
    getParty?: any;
    createParty?: any;
    removeParty?: any;
    removePartyUser?: any;
    transferPartyOwner?: any;
    setBottomDrawerOpen: any;
    updateInviteTarget?: any;
    updateChatTarget?: any;
    updateMessageScrollInit?: any;
    getLayerUsers?: any;
    banUserFromLocation?: any;
}

const initialSelectedUserState = {
    id: '',
    name: '',
    userRole: '',
    identityProviders: [],
    relationType: {},
    inverseRelationType: {},
    subscription: {},
    subscriptions: [],
    avatarUrl: ''
};

const initialGroupForm = {
    id: '',
    name: '',
    groupUsers: [],
    description: ''
};

const LeftDrawer = (props: Props): any => {
    try {
        const {
            authState,
            friendState,
            locationState,
            getFriends,
            unfriend,
            groupState,
            getGroups,
            createGroup,
            harmony,
            patchGroup,
            removeGroup,
            removeGroupUser,
            partyState,
            getParty,
            createParty,
            removeParty,
            removePartyUser,
            transferPartyOwner,
            setLeftDrawerOpen,
            leftDrawerOpen,
            setRightDrawerOpen,
            setBottomDrawerOpen,
            updateInviteTarget,
            updateChatTarget,
            updateMessageScrollInit,
            userState,
            getLayerUsers,
            banUserFromLocation
        } = props;

        const user = authState.get('user') as User;
        const friendSubState = friendState.get('friends');
        const friends = friendSubState.get('friends');
        const groupSubState = groupState.get('groups');
        const groups = groupSubState.get('groups');
        const party = partyState.get('party');
        const [tabIndex, setTabIndex] = useState(0);
        const [friendDeletePending, setFriendDeletePending] = useState('');
        const [groupDeletePending, setGroupDeletePending] = useState('');
        const [groupUserDeletePending, setGroupUserDeletePending] = useState('');
        const [partyDeletePending, setPartyDeletePending] = useState(false);
        const [partyTransferOwnerPending, setPartyTransferOwnerPending] = useState('');
        const [detailsOpen, setDetailsOpen] = useState(false);
        const [detailsType, setDetailsType] = useState('');
        const [selectedUser, setSelectedUser] = useState(initialSelectedUserState);
        const [selectedGroup, setSelectedGroup] = useState(initialGroupForm);
        const [groupForm, setGroupForm] = useState(initialGroupForm);
        const [groupFormMode, setGroupFormMode] = useState('');
        const [groupFormOpen, setGroupFormOpen] = useState(false);
        const [partyUserDeletePending, setPartyUserDeletePending] = useState('');
        const [selectedAccordion, setSelectedAccordion] = useState('');
        const [locationBanPending, setLocationBanPending] = useState('');
        const selfGroupUser = selectedGroup.id && selectedGroup.id.length > 0 ? selectedGroup.groupUsers.find((groupUser) => groupUser.userId === user.id) : {};
        const partyUsers = party && party.partyUsers ? party.partyUsers : [];
        const selfPartyUser = party && party.partyUsers ? party.partyUsers.find((partyUser) => partyUser.userId === user.id) : {};
        const layerUsers = userState.get('layerUsers') ?? [];
        const currentLocation = locationState.get('currentLocation').get('location');
        const isLocationAdmin = user.locationAdmins?.find(locationAdmin => currentLocation.id === locationAdmin.locationId) != null;

        useEffect(() => {
            if (friendState.get('updateNeeded') === true && friendState.get('getFriendsInProgress') !== true) {
                getFriends(0);
            }
            if (friendState.get('closeDetails') === selectedUser.id) {
                closeDetails();
                friendState.set('closeDetails', '');
            }
        }, [friendState]);

        useEffect(() => {
            if (groupState.get('updateNeeded') === true && groupState.get('getGroupsInProgress') !== true) {
                getGroups(0);
            }
            if (groupState.get('closeDetails') === selectedGroup.id) {
                closeDetails();
                groupState.set('closeDetails', '');
            }
        }, [groupState]);

        useEffect(() => {
            if (partyState.get('updateNeeded') === true) {
                getParty();
            }
        }, [partyState]);

        useEffect(() => {
            if (user.instanceId != null && userState.get('layerUsersUpdateNeeded') === true) {
                getLayerUsers();
            }
        }, [user, userState]);

        const showFriendDeleteConfirm = (e, friendId) => {
            e.preventDefault();
            setFriendDeletePending(friendId);
        };

        const cancelFriendDelete = (e) => {
            e.preventDefault();
            setFriendDeletePending('');
        };

        const confirmFriendDelete = (e, friendId) => {
            e.preventDefault();
            setFriendDeletePending('');
            unfriend(friendId);
            closeDetails();
        };

        const nextFriendsPage = (): void => {
            if ((friendSubState.get('skip') + friendSubState.get('limit')) < friendSubState.get('total')) {
                getFriends(friendSubState.get('skip') + friendSubState.get('limit'));
            }
        };

        const showGroupDeleteConfirm = (e, groupId) => {
            e.preventDefault();
            setGroupDeletePending(groupId);
        };

        const cancelGroupDelete = (e) => {
            e.preventDefault();
            setGroupDeletePending('');
        };

        const confirmGroupDelete = (e, groupId) => {
            e.preventDefault();
            setGroupDeletePending('');
            removeGroup(groupId);
            setSelectedGroup(initialGroupForm);
            setDetailsOpen(false);
            setDetailsType('');
        };

        const showLocationBanConfirm = (e, userId) => {
            e.preventDefault();
            setLocationBanPending(userId);
        };

        const cancelLocationBan = (e) => {
            e.preventDefault();
            setLocationBanPending('');
        };

        const confirmLocationBan = (e, userId) => {
            e.preventDefault();
            console.log('Confirming location ban');
            setLocationBanPending('');
            banUserFromLocation(userId, currentLocation.id);
        };

        const nextGroupsPage = (): void => {
            if ((groupSubState.get('skip') + groupSubState.get('limit')) < groupSubState.get('total')) {
                getGroups(groupSubState.get('skip') + groupSubState.get('limit'));
            }
        };

        const showGroupUserDeleteConfirm = (e, groupUserId) => {
            e.preventDefault();
            setGroupUserDeletePending(groupUserId);
        };

        const cancelGroupUserDelete = (e) => {
            e.preventDefault();
            setGroupUserDeletePending('');
        };

        const confirmGroupUserDelete = (e, groupUserId) => {
            e.preventDefault();
            const groupUser = _.find(selectedGroup.groupUsers, (groupUser) => groupUser.id === groupUserId);
            setGroupUserDeletePending('');
            removeGroupUser(groupUserId);
            if (groupUser.userId === user.id) {
                setSelectedGroup(initialGroupForm);
                setDetailsOpen(false);
                setDetailsType('');
            }
        };

        const showPartyDeleteConfirm = (e) => {
            e.preventDefault();
            setPartyDeletePending(true);
        };

        const cancelPartyDelete = (e) => {
            e.preventDefault();
            setPartyDeletePending(false);
        };

        const confirmPartyDelete = (e, partyId) => {
            e.preventDefault();
            setPartyDeletePending(false);
            removeParty(partyId);
        };

        const showPartyUserDeleteConfirm = (e, partyUserId) => {
            e.preventDefault();
            setPartyUserDeletePending(partyUserId);
        };

        const cancelPartyUserDelete = (e) => {
            e.preventDefault();
            setPartyUserDeletePending('');
        };

        const confirmPartyUserDelete = (e, partyUserId) => {
            e.preventDefault();
            setPartyUserDeletePending('');
            removePartyUser(partyUserId);
        };

        const showTransferPartyOwnerConfirm = (e, partyUserId) => {
            e.preventDefault();
            setPartyTransferOwnerPending(partyUserId);
        };

        const cancelTransferPartyOwner = (e) => {
            e.preventDefault();
            setPartyTransferOwnerPending('');
        };

        const confirmTransferPartyOwner = (e, partyUserId) => {
            e.preventDefault();
            setPartyTransferOwnerPending('');
            transferPartyOwner(partyUserId);
        };

        const handleChange = (event: any, newValue: number): void => {
            event.preventDefault();
            setTabIndex(newValue);
        };

        const openDetails = (type, object) => {
            setDetailsOpen(true);
            setDetailsType(type);
            if (type === 'user') {
                setSelectedUser(object);
            } else if (type === 'group') {
                setSelectedGroup(object);
            }
        };

        const closeDetails = () => {
            setDetailsOpen(false);
            setDetailsType('');
            setSelectedUser(initialSelectedUserState);
            setSelectedGroup(initialGroupForm);
        };

        const openGroupForm = (mode: string, group?: GroupType) => {
            setGroupFormOpen(true);
            setGroupFormMode(mode);
            if (group != null) {
                setGroupForm({
                    id: group.id,
                    name: group.name,
                    groupUsers: group.groupUsers,
                    description: group.description
                });
            }
        };

        const closeGroupForm = (): void => {
            setGroupFormOpen(false);
            setGroupForm(initialGroupForm);
        };

        const handleGroupCreateInput = (e: any): void => {
            const value = e.target.value;
            const form = Object.assign({}, groupForm);
            form[e.target.name] = value;
            setGroupForm(form);
        };

        const submitGroup = (e: any): void => {
            e.preventDefault();

            const form = {
                id: groupForm.id,
                name: groupForm.name,
                description: groupForm.description,
            };

            if (groupFormMode === 'create') {
                delete form.id;
                createGroup(form);
            } else {
                patchGroup(form);
            }
            setGroupFormOpen(false);
            setGroupForm(initialGroupForm);
        };

        const createNewParty = (): void => {
            createParty();
        };

        const onListScroll = (e): void => {
            if ((e.target.scrollHeight - e.target.scrollTop) === e.target.clientHeight) {
                if (detailsOpen === false && tabIndex === 0) {
                    nextFriendsPage();
                } else if (detailsOpen === false && tabIndex === 1) {
                    nextGroupsPage();
                }
            }
        };

        const openInvite = (targetObjectType?: string, targetObjectId?: string): void => {
            updateInviteTarget(targetObjectType, targetObjectId);
            setLeftDrawerOpen(false);
            setRightDrawerOpen(true);
        };

        const openChat = (targetObjectType: string, targetObject: any): void => {
            setLeftDrawerOpen(false);
            if (harmony !== true) setBottomDrawerOpen(true);
            setTimeout(() => {
                updateChatTarget(targetObjectType, targetObject);
                updateMessageScrollInit(true);
            }, 100);
        };

        const handleAccordionSelect = (accordionType: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
            if (accordionType === selectedAccordion) {
                setSelectedAccordion('');
            } else {
                setSelectedAccordion(accordionType);
            }
        };

        return (
            <div>
                <SwipeableDrawer
                    className={classNames({
                        [styles['flex-column']]: true,
                        [styles['left-drawer']]: true
                    })}
                    anchor="left"
                    open={leftDrawerOpen === true}
                    onClose={() => {
                        setLeftDrawerOpen(false);
                    }}
                    onOpen={() => {
                    }}
                >
                    {detailsOpen === false && groupFormOpen === false &&
                    <div className={styles['list-container']}>
                        {user.userRole !== 'guest' &&
                        <Accordion expanded={selectedAccordion === 'user'} onChange={handleAccordionSelect('user') } className={styles['MuiAccordion-root']}>
                            <AccordionSummary
                                id="friends-header"
                                expandIcon={<ExpandMore/>}
                                aria-controls="friends-content"
                            >
                                <SupervisedUserCircle/>
                                <Typography>Friends</Typography>
                            </AccordionSummary>
                            <AccordionDetails className={styles['list-container']}>
                                <div className={styles['flex-center']}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<Add/>}
                                        onClick={() => openInvite('user')}>
                                        Invite Friend
                                    </Button>
                                </div>
                                <List
                                    onScroll={(e) => onListScroll(e)}
                                >
                                    {friends && friends.length > 0 && friends.sort((a, b) => a.name - b.name).map((friend, index) => {
                                        return <div key={friend.id}>
                                            <ListItem
                                                className={styles.selectable}
                                                onClick={() => {
                                                    openDetails('user', friend);
                                                }}
                                            >
                                                <ListItemAvatar>
                                                    <Avatar src={friend.avatarUrl}/>
                                                </ListItemAvatar>
                                                <ListItemText primary={friend.name}/>
                                            </ListItem>
                                            {index < friends.length - 1 && <Divider/>}
                                        </div>;
                                    })
                                    }
                                </List>
                            </AccordionDetails>
                        </Accordion>
                        }
                        {user.userRole !== 'guest' &&
                        <Accordion expanded={selectedAccordion === 'group'} onChange={handleAccordionSelect('group')} className={styles['MuiAccordion-root']}>
                            <AccordionSummary
                                id="groups-header"
                                expandIcon={<ExpandMore/>}
                                aria-controls="groups-content"
                            >
                                <Group/>
                                <Typography>Groups</Typography>
                            </AccordionSummary>
                            <AccordionDetails className={styles['list-container']}>
                                <div className={styles['flex-center']}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<Add/>}
                                        onClick={() => openGroupForm('create')}>
                                        Create Group
                                    </Button>
                                </div>
                                <List
                                    onScroll={(e) => onListScroll(e)}
                                >
                                    {groups && groups.length > 0 && groups.sort((a, b) => a.name - b.name).map((group, index) => {
                                        return <div key={group.id}>
                                            <ListItem
                                                className={styles.selectable}
                                                onClick={() => {
                                                    openDetails('group', group);
                                                }}
                                            >
                                                <ListItemText primary={group.name}/>
                                            </ListItem>
                                            {index < groups.length - 1 && <Divider/>}
                                        </div>;
                                    })
                                    }
                                </List>
                            </AccordionDetails>
                        </Accordion>
                        }
                        {user.userRole !== 'guest' &&
                        <Accordion expanded={selectedAccordion === 'party'} onChange={handleAccordionSelect('party')} className={styles['MuiAccordion-root']}>
                            <AccordionSummary
                                id="party-header"
                                expandIcon={<ExpandMore/>}
                                aria-controls="party-content"
                            >
                                <GroupWork/>
                                <Typography>Party</Typography>
                            </AccordionSummary>
                            <AccordionDetails className={classNames({
                                [styles.flexbox]: true,
                                [styles['flex-column']]: true,
                                [styles['flex-center']]: true
                            })}>
                                {party == null &&
                                <div>
                                    <div className={styles.title}>You are not currently in a party</div>
                                    <div className={styles['flex-center']}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            startIcon={<Add/>}
                                            onClick={() => createNewParty()}>
                                            Create Party
                                        </Button>
                                    </div>
                                </div>
                                }
                                {party != null &&
                                <div className={styles['list-container']}>
                                    <div className={styles.title}>Current Party</div>
                                    <div className={classNames({
                                        [styles['party-id']]: true,
                                        [styles['flex-center']]: true
                                    })}>
                                        <div>ID: {party.id}</div>
                                    </div>
                                    <div className={classNames({
                                        'action-buttons': true,
                                        [styles['flex-center']]: true,
                                        [styles['flex-column']]: true
                                    })}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            startIcon={<Forum/>}
                                            onClick={() => openChat('party', party)}
                                        >
                                            Chat
                                        </Button>
                                        {
                                            (selfPartyUser?.isOwner === true || selfPartyUser?.isOwner === 1) &&
                                            <Button
                                                variant="contained"
                                                color="secondary"
                                                startIcon={<PersonAdd/>}
                                                onClick={() => openInvite('party', party.id)}
                                            >
                                                Invite
                                            </Button>
                                        }
                                        {
                                            partyDeletePending !== true &&
                                            (selfPartyUser?.isOwner === true || selfPartyUser?.isOwner === 1) &&
                                            <Button
                                                variant="contained"
                                                className={styles['background-red']}
                                                startIcon={<Delete/>}
                                                onClick={(e) => showPartyDeleteConfirm(e)}
                                            >
                                                Delete
                                            </Button>
                                        }
                                        {partyDeletePending === true &&
                                        <div>
                                            <Button variant="contained"
                                                    startIcon={<Delete/>}
                                                    className={styles['background-red']}
                                                    onClick={(e) => confirmPartyDelete(e, party.id)}
                                            >
                                                Confirm Delete
                                            </Button>
                                            <Button variant="contained"
                                                    color="secondary"
                                                    onClick={(e) => cancelPartyDelete(e)}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                        }
                                    </div>
                                    <Divider/>
                                    <div className={classNames({
                                        [styles.title]: true,
                                        [styles['margin-top']]: true
                                    })}>Members</div>
                                    <List
                                        className={classNames({
                                            [styles['flex-center']]: true,
                                            [styles['flex-column']]: true
                                        })}
                                        onScroll={(e) => onListScroll(e)}
                                    >
                                        {partyUsers && partyUsers.length > 0 && partyUsers.sort((a, b) => a.name - b.name).map((partyUser) => {
                                                return <ListItem key={partyUser.id}>
                                                    <ListItemAvatar>
                                                        <Avatar src={partyUser.user.avatarUrl}/>
                                                    </ListItemAvatar>
                                                    {user.id === partyUser.userId && (partyUser.isOwner === true || partyUser.isOwner === 1) &&
                                                    <ListItemText primary={partyUser.user.name + ' (you, owner)'}/>}
                                                    {user.id === partyUser.userId && (partyUser.isOwner !== true && partyUser.isOwner !== 1) &&
                                                    <ListItemText primary={partyUser.user.name + ' (you)'}/>}
                                                    {user.id !== partyUser.userId && (partyUser.isOwner === true || partyUser.isOwner === 1) &&
                                                    <ListItemText primary={partyUser.user.name + ' (owner)'}/>}
                                                    {user.id !== partyUser.userId && (partyUser.isOwner !== true && partyUser.isOwner !== 1) &&
                                                    <ListItemText primary={partyUser.user.name}/>}
                                                    {
                                                        partyUserDeletePending !== partyUser.id &&
                                                        partyTransferOwnerPending !== partyUser.id &&
                                                        (selfPartyUser?.isOwner === true || selfPartyUser?.isOwner === 1) &&
                                                        user.id !== partyUser.userId &&
                                                        <Button variant="contained"
                                                                color="primary"
                                                                onClick={(e) => showTransferPartyOwnerConfirm(e, partyUser.id)}
                                                        >
                                                            Make Owner
                                                        </Button>
                                                    }
                                                    {
                                                        partyUserDeletePending !== partyUser.id &&
                                                        partyTransferOwnerPending === partyUser.id &&
                                                        <div>
                                                            <Button variant="contained"
                                                                    color="primary"
                                                                    onClick={(e) => confirmTransferPartyOwner(e, partyUser.id)}
                                                            >
                                                                Confirm Transfer
                                                            </Button>
                                                            <Button variant="contained"
                                                                    color="secondary"
                                                                    onClick={(e) => cancelTransferPartyOwner(e)}
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    }
                                                    {
                                                        partyTransferOwnerPending !== partyUser.id &&
                                                        partyUserDeletePending !== partyUser.id &&
                                                        (selfPartyUser?.isOwner === true || selfPartyUser?.isOwner === 1) &&
                                                        user.id !== partyUser.userId &&
                                                        <div>
                                                            <Button
                                                                onClick={(e) => showPartyUserDeleteConfirm(e, partyUser.id)}>
                                                                <Delete/>
                                                            </Button>
                                                        </div>
                                                    }
                                                    {partyUserDeletePending !== partyUser.id && user.id === partyUser.userId &&
                                                    <div>
                                                        <Button
                                                            onClick={(e) => showPartyUserDeleteConfirm(e, partyUser.id)}>
                                                            <Delete/>
                                                        </Button>
                                                    </div>
                                                    }
                                                    {
                                                        partyTransferOwnerPending !== partyUser.id &&
                                                        partyUserDeletePending === partyUser.id &&
                                                        <div>
                                                            {
                                                                user.id !== partyUser.userId &&
                                                                <Button variant="contained"
                                                                        color="primary"
                                                                        onClick={(e) => confirmPartyUserDelete(e, partyUser.id)}
                                                                >
                                                                    Remove User
                                                                </Button>
                                                            }
                                                            {
                                                                user.id === partyUser.userId &&
                                                                <Button variant="contained"
                                                                        color="primary"
                                                                        onClick={(e) => confirmPartyUserDelete(e, partyUser.id)}
                                                                >
                                                                    Leave party
                                                                </Button>
                                                            }
                                                            <Button variant="contained"
                                                                    color="secondary"
                                                                    onClick={(e) => cancelPartyUserDelete(e)}
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    }
                                                </ListItem>;
                                            }
                                        )
                                        }
                                    </List>
                                </div>
                                }
                            </AccordionDetails>
                        </Accordion>
                        }
                        {
                            user && user.instanceId &&
                            <Accordion expanded={selectedAccordion === 'layerUsers'}
                                       onChange={handleAccordionSelect('layerUsers')}>
                                <AccordionSummary
                                    id="layer-user-header"
                                    expandIcon={<ExpandMore/>}
                                    aria-controls="layer-user-content"
                                >
                                    <Public/>
                                    <Typography>Layer Users</Typography>
                                </AccordionSummary>
                                <AccordionDetails className={classNames({
                                    [styles.flexbox]: true,
                                    [styles['flex-column']]: true,
                                    [styles['flex-center']]: true
                                })}>
                                    <div className={styles['list-container']}>
                                        <div className={styles.title}>Users on this Layer</div>
                                        <List
                                            className={classNames({
                                                [styles['flex-center']]: true,
                                                [styles['flex-column']]: true
                                            })}
                                            onScroll={(e) => onListScroll(e)}
                                        >
                                            {layerUsers && layerUsers.length > 0 && layerUsers.sort((a, b) => a.name - b.name).map((layerUser) => {
                                                    return <ListItem key={layerUser.id}>
                                                        <ListItemAvatar>
                                                            <Avatar src={layerUser.avatarUrl}/>
                                                        </ListItemAvatar>
                                                        {user.id === layerUser.id &&
                                                        <ListItemText primary={layerUser.name + ' (you)'}/>}
                                                        {user.id !== layerUser.id &&
                                                        <ListItemText primary={layerUser.name}/>}
                                                        {
                                                            locationBanPending !== layerUser.id &&
                                                            isLocationAdmin === true &&
                                                            user.id !== layerUser.id &&
                                                            layerUser.locationAdmins?.find(locationAdmin => locationAdmin.locationId === currentLocation.id) == null &&
                                                            <Tooltip title="Ban user">
                                                                <Button onClick={(e) => showLocationBanConfirm(e, layerUser.id)}>
                                                                    <Block/>
                                                                </Button>
                                                            </Tooltip>
                                                        }
                                                        {locationBanPending === layerUser.id &&
                                                        <div>
                                                            <Button variant="contained"
                                                                    color="primary"
                                                                    onClick={(e) => confirmLocationBan(e, layerUser.id)}
                                                            >
                                                                Ban User
                                                            </Button>
                                                            <Button variant="contained"
                                                                    color="secondary"
                                                                    onClick={(e) => cancelLocationBan(e)}
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                        }
                                                    </ListItem>;
                                                }
                                            )
                                            }
                                        </List>
                                    </div>
                                </AccordionDetails>
                            </Accordion>
                        }
                    </div>
                    }
                    {detailsOpen === true && groupFormOpen === false && detailsType === 'user' &&
                    <div className={classNames({
                        [styles['flex-center']]: true,
                        [styles['flex-column']]: true
                    })}>
                        <div className={styles.header}>
                            <Button onClick={closeDetails}>
                                <ArrowLeft/>
                            </Button>
                            <Divider/>
                        </div>
                        <div className={styles.details}>
                            <div className={classNames({
                                [styles.avatarUrl]: true,
                                [styles['flex-center']]: true
                            })}>
                                <Avatar src={selectedUser.avatarUrl}/>
                            </div>
                            <div className={classNames({
                                [styles.userName]: true,
                                [styles['flex-center']]: true
                            })}>
                                <div>{selectedUser.name}</div>
                            </div>
                            <div className={classNames({
                                [styles.userId]: true,
                                [styles['flex-center']]: true
                            })}>
                                <div>ID: {selectedUser.id}</div>
                            </div>
                            <div className={classNames({
                                'action-buttons': true,
                                [styles['flex-center']]: true,
                                [styles['flex-column']]: true
                            })}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<Forum/>}
                                    onClick={() => {
                                        openChat('user', selectedUser);
                                    }}
                                >
                                    Chat
                                </Button>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    startIcon={<PersonAdd/>}
                                    onClick={() => openInvite('user', selectedUser.id)}
                                >
                                    Invite
                                </Button>
                                {friendDeletePending !== selectedUser.id &&
                                <Button
                                    variant="contained"
                                    className={styles['background-red']}
                                    startIcon={<Delete/>}
                                    onClick={(e) => showFriendDeleteConfirm(e, selectedUser.id)}
                                >
                                    Unfriend
                                </Button>}
                                {friendDeletePending === selectedUser.id &&
                                <div>
                                    <Button variant="contained"
                                            startIcon={<Delete/>}
                                            className={styles['background-red']}
                                            onClick={(e) => confirmFriendDelete(e, selectedUser.id)}
                                    >
                                        Unfriend
                                    </Button>
                                    <Button variant="contained"
                                            color="secondary"
                                            onClick={(e) => cancelFriendDelete(e)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                                }
                            </div>
                        </div>
                    </div>
                    }
                    {detailsOpen === true && groupFormOpen === false && detailsType === 'group' &&
                    <div className={styles['details-container']}>
                        <div className={styles.header}>
                            <Button onClick={closeDetails}>
                                <ArrowLeft/>
                            </Button>
                            <Divider/>
                        </div>
                        <div className={classNames({
                            [styles.details]: true,
                            [styles['list-container']]: true
                        })}>
                            <div className={classNames({
                                [styles.title]: true,
                                [styles['flex-center']]: true
                            })}>
                                <div>{selectedGroup.name}</div>
                            </div>
                            <div className={classNames({
                                'group-id': true,
                                [styles['flex-center']]: true
                            })}>
                                <div>ID: {selectedGroup.id}</div>
                            </div>
                            <div className={classNames({
                                [styles.description]: true,
                                [styles['flex-center']]: true
                            })}>
                                <div>{selectedGroup.description}</div>
                            </div>
                            <div className={classNames({
                                'action-buttons': true,
                                [styles['flex-center']]: true,
                                [styles['flex-column']]: true
                            })}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<Forum/>}
                                    onClick={() => {
                                        openChat('group', selectedGroup);
                                    }}
                                >
                                    Chat
                                </Button>
                                {selfGroupUser != null && (selfGroupUser.groupUserRank === 'owner') &&
                                <Button
                                    variant="contained"
                                    startIcon={<Edit/>}
                                    onClick={() => openGroupForm('update', selectedGroup)}
                                >
                                    Edit
                                </Button>
                                }
                                {selfGroupUser != null && (selfGroupUser.groupUserRank === 'owner' || selfGroupUser.groupUserRank === 'admin') &&
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    startIcon={<PersonAdd/>}
                                    onClick={() => openInvite('group', selectedGroup.id)}
                                >
                                    Invite
                                </Button>
                                }
                                {groupDeletePending !== selectedGroup.id &&
                                selfGroupUser != null && selfGroupUser.groupUserRank === 'owner' &&
                                <Button
                                    variant="contained"
                                    className={styles['background-red']}
                                    startIcon={<Delete/>}
                                    onClick={(e) => showGroupDeleteConfirm(e, selectedGroup.id)}
                                >
                                    Delete
                                </Button>}
                                {groupDeletePending === selectedGroup.id &&
                                <div>
                                    <Button variant="contained"
                                            startIcon={<Delete/>}
                                            className={styles['background-red']}
                                            onClick={(e) => confirmGroupDelete(e, selectedGroup.id)}
                                    >
                                        Confirm Delete
                                    </Button>
                                    <Button variant="contained"
                                            color="secondary"
                                            onClick={(e) => cancelGroupDelete(e)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                                }
                            </div>
                            <Divider/>
                            <div className={classNames({
                                [styles.title]: true,
                                [styles['margin-top']]: true
                            })}>Members</div>
                            <List className={classNames({
                                [styles['flex-center']]: true,
                                [styles['flex-column']]: true,
                            })}>
                                {selectedGroup && selectedGroup.groupUsers && selectedGroup.groupUsers.length > 0 && selectedGroup.groupUsers.sort((a, b) => a.name - b.name).map((groupUser) => {
                                        return <ListItem key={groupUser.id}>
                                            <ListItemAvatar>
                                                <Avatar src={groupUser.user.avatarUrl}/>
                                            </ListItemAvatar>
                                            {user.id === groupUser.userId &&
                                            <ListItemText primary={groupUser.user.name + ' (you)'}/>}
                                            {user.id !== groupUser.userId && <ListItemText primary={groupUser.user.name}/>}
                                            {
                                                groupUserDeletePending !== groupUser.id &&
                                                selfGroupUser != null &&
                                                (selfGroupUser.groupUserRank === 'owner' || selfGroupUser.groupUserRank === 'admin') &&
                                                user.id !== groupUser.userId &&
                                                <Button onClick={(e) => showGroupUserDeleteConfirm(e, groupUser.id)}>
                                                    <Delete/>
                                                </Button>
                                            }
                                            {groupUserDeletePending !== groupUser.id && user.id === groupUser.userId &&
                                            <div>
                                                <Button onClick={(e) => showGroupUserDeleteConfirm(e, groupUser.id)}>
                                                    <Delete/>
                                                </Button>
                                            </div>
                                            }
                                            {groupUserDeletePending === groupUser.id &&
                                            <div>
                                                {
                                                    user.id !== groupUser.userId &&
                                                    <Button variant="contained"
                                                            color="primary"
                                                            onClick={(e) => confirmGroupUserDelete(e, groupUser.id)}
                                                    >
                                                        Remove User
                                                    </Button>
                                                }
                                                {
                                                    user.id === groupUser.userId &&
                                                    <Button variant="contained"
                                                            color="primary"
                                                            onClick={(e) => confirmGroupUserDelete(e, groupUser.id)}
                                                    >
                                                        Leave group
                                                    </Button>
                                                }
                                                <Button variant="contained"
                                                        color="secondary"
                                                        onClick={(e) => cancelGroupUserDelete(e)}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                            }
                                        </ListItem>;
                                    }
                                )
                                }
                            </List>
                        </div>
                    </div>
                    }
                    {
                        groupFormOpen === true &&
                        <form className={styles['group-form']} noValidate onSubmit={(e) => submitGroup(e)}>
                            {groupFormMode === 'create' && <div className={styles.title}>New Group</div>}
                            {groupFormMode === 'update' && <div className={styles.title}>Update Group</div>}
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="name"
                                label="Group Name"
                                name="name"
                                autoComplete="name"
                                autoFocus
                                value={groupForm.name}
                                onChange={(e) => handleGroupCreateInput(e)}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="description"
                                label="Group Description"
                                name="description"
                                autoComplete="description"
                                autoFocus
                                value={groupForm.description}
                                onChange={(e) => handleGroupCreateInput(e)}
                            />
                            <div className={classNames({
                                [styles['flex-center']]: true,
                                [styles['flex-column']]: true
                            })}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    className={styles.submit}
                                >
                                    {groupFormMode === 'create' && 'Create Group'}
                                    {groupFormMode === 'update' && 'Update Group'}
                                </Button>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={() => closeGroupForm()}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    }
                </SwipeableDrawer>
            </div>
        );
    } catch(err) {
        console.log('LeftDrawer error:');
        console.log(err);
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(LeftDrawer);
