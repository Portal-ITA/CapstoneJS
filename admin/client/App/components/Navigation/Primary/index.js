/**
 * The primary (i.e. uppermost) navigation on desktop. Renders all sections and
 * the home-, website- and signout buttons.
 */

import React from 'react';
import { Container } from '../../../elemental';
import PrimaryNavItem from './NavItem';

var PrimaryNavigation = React.createClass({
	displayName: 'PrimaryNavigation',
	propTypes: {
		brand: React.PropTypes.string,
		currentSectionKey: React.PropTypes.string,
		sections: React.PropTypes.array.isRequired,
        signoutUrl: React.PropTypes.string,
        language: React.PropTypes.string,
        languageList: React.PropTypes.array,
	},
	getInitialState () {
		return {};
	},
	// Handle resizing, hide this navigation on mobile (i.e. < 768px) screens
	componentDidMount () {
		this.handleResize();
		window.addEventListener('resize', this.handleResize);
	},
	componentWillUnmount () {
		window.removeEventListener('resize', this.handleResize);
	},
	handleResize () {
		this.setState({
			navIsVisible: window.innerWidth >= 768,
		});
	},
	// Render the sign out button
	renderSignout () {
		if (!this.props.signoutUrl) return null;

		return (
			<PrimaryNavItem
				label="octicon-sign-out"
				href={this.props.signoutUrl}
				title="Sign Out"
			>
				<span className="octicon octicon-sign-out" />
			</PrimaryNavItem>
		);
    },
    // Render change language list
    renderLanguageButton () {
        if (!this.props.languageList || !this.props.languageList.length) return null;

        return this.props.languageList.map((language) => {
            const isActive = this.props.language === language;
            const className = isActive ? 'primary-navbar__link--spotlight' : 'primary-navbar__link--soften';
            const href = `${Capstone.adminPath}/language/${language}`;
            
            return (
                <PrimaryNavItem
                    active={isActive}
                    label=""
                    href={href}
                    title={'Language: ' + language.toUpperCase()}
                    className={className}
                >
                    {language.toUpperCase()}
                </PrimaryNavItem>
            );
        });
    },
	// Render the back button
	renderBackButton () {
		if (!Capstone.backUrl) return null;

		return (
			<PrimaryNavItem
				label="octicon-globe"
				href={Capstone.backUrl}
				title={'Front page - ' + this.props.brand}
			>
				<span className="octicon octicon-globe" />
			</PrimaryNavItem>
		);
	},
	// Render the link to the webpage
	renderFrontLink () {
		return (
			<ul className="app-nav app-nav--primary app-nav--right">
                {this.renderLanguageButton()}
				{this.renderBackButton()}
				{this.renderSignout()}
			</ul>
		);
	},
	renderBrand () {
		// TODO: support navbarLogo from capstone config

		const { brand, currentSectionKey } = this.props;
		const className = currentSectionKey === 'dashboard' ? 'primary-navbar__brand primary-navbar__item--active' : 'primary-navbar__brand';

		return (
			<PrimaryNavItem
				className={className}
				label="octicon-home"
				title={'Dashboard - ' + brand}
				to={Capstone.adminPath}
			>
				<span className="octicon octicon-home" />
			</PrimaryNavItem>
		);
	},
	// Render the navigation
	renderNavigation () {
		if (!this.props.sections || !this.props.sections.length) return null;

		return this.props.sections.map((section) => {
			// Get the link and the class name
			const to = !section.lists[0].external && `${Capstone.adminPath}/${section.lists[0].path}`;
			const href = section.lists[0].external && section.lists[0].path;
			const isActive = this.props.currentSectionKey && this.props.currentSectionKey === section.key;
			const className = isActive ? 'primary-navbar__item--active' : null;

            return (
				<PrimaryNavItem
					active={isActive}
					key={section.key}
					label={section.label}
					className={className}
					to={to}
					href={href}
				>
					{section.label}
				</PrimaryNavItem>
			);
		});
	},
	render () {
		if (!this.state.navIsVisible) return null;

		return (
			<nav className="primary-navbar">
				<Container clearFloatingChildren>
					<ul className="app-nav app-nav--primary app-nav--left">
						{this.renderBrand()}
						{this.renderNavigation()}
					</ul>
					{this.renderFrontLink()}
				</Container>
			</nav>
		);
	},
});

module.exports = PrimaryNavigation;
