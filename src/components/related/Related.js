import React, { useState, useEffect } from 'react';
import CarouselComponent, { AddOutfitCard, AddButtonText } from './Carousel/CarouselComponent';
import Modal from './Modal/Modal';
import { URL } from '../App';
import styled, { css } from 'styled-components';

const Titles = styled.h3`
  font-size: 1.17em;
  font-family: ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";
`;

const RelatedAndOutfitContainer = styled.div`
  /* margin-bottom: 2rem;
  margin-top: 2rem; */

  // Added this line, not sure if I'll need to keep it or not
  position: relative;
  width: fit-content;
`;

export const TextH3 = styled.h3`
  font-size: 1rem;
  font-family: ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";
`;

const ModalContainer = styled.div`
  ${(props) => {
    if (props.isOpen) {
      return css`
        opacity: 1;
      `;
    }
    return css`
      opacity: 0;
    `;
  }}
  transition: opacity 0.2s ease-in-out;
`;

export const defFont = 'ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"';

function Related({
  product, // overview product
  handleItemClick, // event handler to change the state when an item is clicked
  productStyle, // the styles object for the overview product
  curStyleId, // current index of the style that is being looked at
  averageStarRating // average star rating
}) {
  const [emptyRelatedBool, setEmptyRelatedBool] = useState(false); // state boolean to let me know
  // if a related list for a product is truly empty or not
  const [relatedIDs, setRelatedIDs] = useState([]); // the IDs from the API call, just to see
  const [relStyles, setRelStyles] = useState({}); // object that contains the default styles for all
  const [relInfos, setRelInfos] = useState({}); // similar object above but with general endpoint
  const [relReviews, setRelReviews] = useState({}); // the average rating for each related product

  // This will be for the state of the outfit list
  // Will be intially generated by localStorage
  // Will pass down functions into OutfitList to handle things to it
  const [outfitList, setOutfitList] = useState([]);
  const [relatedActiveIndex, setRelatedActiveIndex] = useState(0);
  const [outfitActiveIndex, setOutfitActiveIndex] = useState(0);

  // For the popup modal view
  const [modalCardIndex, setModalCardIndex] = useState(null); // to manage the index selected
  const [isOpen, setIsOpen] = useState(false); // this is to manage if it is open or not

  // Will be used to find the default style based on a given productID
  function updateDefaultStyle(productID) {
    fetch(`/style/${productID}`)
      .then((response) => response.json())
      .then((result) => {
        // Result is an individual request from this styles api
        // So an object containing all the styles
        let bool = false;
        let defaultStyle;
        result.results.forEach((style) => {
          if (!bool && style['default?']) {
            // this is default style
            defaultStyle = { [result.product_id]: style };
            bool = true;
          }
        });
        // If there wasn't a default style, choose first one from list
        if (!bool) {
          defaultStyle = { [result.product_id]: result.results[0] };
        }
        // Create an object with the key = product_id and the value
        // equal to the default style object
        setRelStyles((oldObject) => ({
          ...oldObject,
          ...defaultStyle,
        }));
      });
  }

  function updateProductInfo(productID) {
    fetch(`/product/${productID}`)
      .then((response) => response.json())
      .then((result) => {
        // Getting the product name and the category
        // UPDATE: Just get the whole product_info object
        const newId = {
          [result.id]: result,
        };
        // Saving it to object with the product id as the key
        setRelInfos((oldObject) => ({
          ...oldObject,
          ...newId,
        }));
      });
  }

  function updateRelReviewsInfo(productID) {
    // this will fetch the metadata from each related id,
    // look at the ratings and calculate the average (rounded down to the nearest quarter),
    // and save it as an integer value to each product id
    fetch(`/review/${productID}`)
      .then((response) => response.json())
      .then((result) => {
        // result.ratings is the object i want to look at
        let stars = Object.keys(result.ratings).map((num) => Number(num));
        let total_reviews = Object.values(result.ratings).reduce((a, b) => a + Number(b), 0);
        let total_stars = stars.reduce((a, b) => a + b * Number(result.ratings[b]), 0);
        let res = Math.floor((total_stars / total_reviews) * 4) / 4;

        let newReview = { [result.product_id]: res };
        setRelReviews((oldObject) => ({
          ...oldObject,
          ...newReview,
        }));
      });
  }

  // This houses all of the API calls necessary for each Related Product ID
  function updateRelStyles(id) {
    fetch(`/related/${id}`)
      .then((response) => response.json())
      .then((results) => {
        // Make sure that the related ids don't contain the actual product id itself
        results = results.filter((id) => {
          if (id !== product.id) {
            return id;
          }
        });
        setRelatedIDs(results);
        if (results.length > 0) {
          results.forEach((product_id) => {
            // I believe I want to get the product_id info before this
            // These are both async so it's really important that the
            // second one happens after the first. I might need to look
            // into async await for this
            updateProductInfo(product_id);
            updateDefaultStyle(product_id);
            updateRelReviewsInfo(product_id);
          });
        } else {
          // Else there are no related products
          setEmptyRelatedBool(true);
        }
      });
  }

  // --------------------------------------------------
  // MY OUTFIT FUNCTIONS
  // Generate the initial list by setting state value for outfitList equal to localStorage.outfit
  function generateInitialOutfitList() {
    // I want to set the initial state of outfit using localStorage
    if (localStorage.outfit) {
      // if there is presently entries into outfit,
      // we want to set the state of outfit to this array.
      const arr = JSON.parse(localStorage.outfit);
      setOutfitList(arr);
    }
  }
  // Add currently viewed product/style to outfit
  function handleAddToOutfit() {
    // This will be when the user clicks add to outfit
    // Update the state of outfitList and add to localStorage.outfit
    if (!localStorage.outfit) {
      let res = {
        id: productStyle.product_id,
        info: {category: product.category, name: product.name},
        review: Number(averageStarRating),
        style: productStyle.results[curStyleId]
      };
      localStorage.setItem('outfit', JSON.stringify([res]));
      setOutfitList((oldArray) => [...oldArray, res]);
    } else {
      // const currOutfitList = JSON.parse(localStorage.outfit);
      const currOutfitList = [...outfitList]; // faster than looking in localStorage?
      // This is where I want to see if the item is already in the outfit list
      // currOutfitList is an array of objects
      let bool = true;
      for (let i = 0; i < currOutfitList.length; i++) {
        const outfit = currOutfitList[i];
        // If the product ids are the same AND the style ids are the same,
        // this is the same product and cannot be added to outfit list
        if (outfit.id === productStyle.product_id
          && outfit.style.style_id === productStyle.results[curStyleId].style_id) {
          // this is the same product and I will not add it to the outfit list
          console.log('Same product and style cannot be added to outfit');
          bool = false;
          break;
        }
      }
      // If the product/style wasn't found in the list, add it to the outfit list
      if (bool) {
        // If the product isn't already in the outfit list, add it to it
        let res = {
          id: productStyle.product_id,
          info: {category: product.category, name: product.name},
          review: Number(averageStarRating),
          style: productStyle.results[curStyleId]
        };
        currOutfitList.push(res);
        let newOutfitList = JSON.stringify(currOutfitList);
        localStorage.setItem('outfit', newOutfitList);
        setOutfitList((oldArray) => [...oldArray, res]);
      }
    }
  }
  // Remove specific entry from outfit
  function removeItemFromOutfit(index) {
    // we are going to be returned the id in the array (hopefully),
    // and use that to splice it from outfitList and will update localStorage
    let temp = [...outfitList];
    temp.splice(index, 1);
    setOutfitList(temp);
    let newOutfitList = JSON.stringify(temp);
    localStorage.setItem('outfit', newOutfitList);
  }
  // --------------------------------------------------

  // --------------------------------------------------
  // RELATED LIST FUNCTIONS
  function comparisonModal(index) {
    // This will be triggered when the star action button is clicked for
    // the individual related list item.
    if (!isOpen) {
      console.log(`Compare Related Item at index: ${index} to Overview Product`);
      setModalCardIndex(index);
      // Set the value so it is now open
      // This works!
      setIsOpen(true);
    } else if (isOpen && index === modalCardIndex) {
      // In the event that the same star button was clicked, we want to close the window
      setIsOpen(false);
      setModalCardIndex(null);
    } else {
      console.log(`Compare Another Related Item at index: ${index} to Overview Product`);
      // There is already a modal open and another one has been clicked on, meaning
      // I should close this and open the next one
      // setIsOpen(false);
      setModalCardIndex(index);
    }
  }

  function resetStateValues() {
    // I want to reset all pertinent state values back to their defaults here
    setEmptyRelatedBool(false);
    setRelStyles({});
    setRelInfos({});
    setRelReviews({});
    setRelatedActiveIndex(0);
    setOutfitActiveIndex(0);
  }

  useEffect(() => {
    console.log('Updating related products');
    // Maybe do a promise.all here to make sure that all the states are reset?
    resetStateValues();
    updateRelStyles(product.id);
    generateInitialOutfitList();
  }, [product]); // might need product here

  // Need to handle the case when relatedIDs is empty
  if (emptyRelatedBool) {
    // this means there is no related list but still an outfit List
    return (
      <RelatedAndOutfitContainer>
        <Titles>Recommended For You</Titles>
        <AddOutfitCard
          style={{"transform": "translateX(-0.5rem)"}}
        >
          <AddButtonText
            style={{"top": "7rem", "left": "1.52rem"}}
          >
            No Related Items for Current Product
          </AddButtonText>
        </AddOutfitCard>
        <Titles>My Outfit</Titles>
        <CarouselComponent
          RelatedListBool={false}
          OutfitListBool={true}
          outfitList={outfitList}
          outfitActiveIndex={outfitActiveIndex}
          setOutfitActiveIndex={setOutfitActiveIndex}
          handleAddToOutfit={handleAddToOutfit}
          removeItemFromOutfit={removeItemFromOutfit}
          handleItemClick={handleItemClick}
        />
        <ModalContainer id="modal-root" isOpen={isOpen}>
          <Modal
            modalCardIndex={modalCardIndex}
            setModalCardIndex={setModalCardIndex}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            // From current overview product and style
            overviewProduct={product} // general product info
            overviewStyle={productStyle.results[curStyleId]} // specific style info
            overviewRating={averageStarRating} // average star rating from overview product
            // From the selected card in related items list
            relatedProduct={Object.values(relInfos)[modalCardIndex]}
            relatedStyle={Object.values(relStyles)[modalCardIndex]}
            relatedRating={Object.values(relReviews)[modalCardIndex]}
          />
        </ModalContainer>
      </RelatedAndOutfitContainer>
    );
  }
  // Conditional rendering while waiting for the other api calls to be made
  if (Object.keys(relStyles).length === 0 || Object.keys(relInfos).length === 0 || Object.keys(relReviews).length === 0) {
    return <div>Loading...</div>;
  }
  // If everything is loaded, return the actual component
  return (
    <RelatedAndOutfitContainer>
      <Titles>Recommended For You</Titles>
      {/* This is Related List */}
      <CarouselComponent
        RelatedListBool={true}
        OutfitListBool={false}
        relStyles={relStyles}
        relInfos={relInfos}
        relReviews={relReviews}
        relatedActiveIndex={relatedActiveIndex}
        setRelatedActiveIndex={setRelatedActiveIndex}
        comparisonModal={comparisonModal}
        handleItemClick={handleItemClick}
      />
      <Titles>My Outfit</Titles>
      {/* This is Outfit List */}
      <CarouselComponent
        RelatedListBool={false}
        OutfitListBool={true}
        outfitList={outfitList}
        outfitActiveIndex={outfitActiveIndex}
        setOutfitActiveIndex={setOutfitActiveIndex}
        handleAddToOutfit={handleAddToOutfit}
        removeItemFromOutfit={removeItemFromOutfit}
        handleItemClick={handleItemClick}
      />
      <ModalContainer id="modal-root" isOpen={isOpen}>
        <Modal
          modalCardIndex={modalCardIndex}
          setModalCardIndex={setModalCardIndex}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          // From current overview product and style
          overviewProduct={product} // general product info
          overviewStyle={productStyle.results[curStyleId]} // specific style info
          overviewRating={averageStarRating} // average star rating from overview product
          // From the selected card in related items list
          relatedProduct={Object.values(relInfos)[modalCardIndex]}
          relatedStyle={Object.values(relStyles)[modalCardIndex]}
          relatedRating={Object.values(relReviews)[modalCardIndex]}
        />
      </ModalContainer>
    </RelatedAndOutfitContainer>
  );
}
export default Related;
