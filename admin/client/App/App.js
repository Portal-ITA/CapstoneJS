/**
 * The App component is the component that is rendered around all views, and
 * contains common things like navigation, footer, etc.
 */

import React from 'react';
import { Container } from './elemental';
import { Link } from 'react-router';
import { css } from 'glamor';

import MobileNavigation from './components/Navigation/Mobile';
import PrimaryNavigation from './components/Navigation/Primary';
import SecondaryNavigation from './components/Navigation/Secondary';
import Footer from './components/Footer';

const classes = {
	wrapper: {
		display: 'flex',
		flexDirection: 'column',
		minHeight: '100vh',
	},
	body: {
		flexGrow: 1,
	},
};

const App = (props) => {
	const listsByPath = require('../utils/lists').listsByPath;
	let children = props.children;
	// If we're on either a list or an item view
	let currentList, currentSection;
	if (props.params.listId) {
		currentList = listsByPath[props.params.listId];
		// If we're on a list path that doesn't exist (e.g. /capstone/gibberishasfw34afsd) this will
		// be undefined
		if (!currentList) {
			children = (
				<Container>
					<p>List not found!</p>
					<Link to={`${Capstone.adminPath}`}>
						Go back home
					</Link>
				</Container>
			);
		} else {
			// Get the current section we're in for the navigation
			currentSection = Capstone.nav.by.list[currentList.key];
		}
	}
	// Default current section key to dashboard
	const currentSectionKey = (currentSection && currentSection.key) || 'dashboard';
	return (
		<div className={css(classes.wrapper)}>
			<header>
				<MobileNavigation
					brand={Capstone.brand}
					currentListKey={props.params.listId}
					currentSectionKey={currentSectionKey}
					sections={Capstone.nav.sections}
                    language={Capstone.language}
                    languageList={Capstone.languageList}
					signoutUrl={Capstone.signoutUrl}
				/>
				<PrimaryNavigation
					currentSectionKey={currentSectionKey}
					brand={Capstone.brand}
					sections={Capstone.nav.sections}
                    language={Capstone.language}
                    languageList={Capstone.languageList}
					signoutUrl={Capstone.signoutUrl}
				/>
				{/* If a section is open currently, show the secondary nav */}
				{(currentSection) ? (
					<SecondaryNavigation
						currentListKey={props.params.listId}
						lists={currentSection.lists}
						itemId={props.params.itemId}
					/>
				) : null}
			</header>
			<main className={css(classes.body)}>
				{children}
			</main>
			<Footer
				appversion={Capstone.appversion}
				backUrl={Capstone.backUrl}
				brand={Capstone.brand}
				User={Capstone.User}
				user={Capstone.user}
				version={Capstone.version}
			/>
		</div>
	);
};

module.exports = App;
